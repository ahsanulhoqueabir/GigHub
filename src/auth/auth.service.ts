import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { DatabaseService } from '../database/database.service';
import { FirebaseService } from '../firebase/firebase.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleSignupDto } from './dto/google-signup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly firebase: FirebaseService,
    private readonly jwtService: JwtService,
  ) {}

  async generateUniqueUsername(email: string): Promise<string> {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = base || 'user';
    let count = 0;
    while (true) {
      const { data, error } = await this.db.client
        .from('profile')
        .select('id')
        .eq('username', username);

      if (error) {
        throw new Error(`Failed to check username uniqueness: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return username;
      }
      count++;
      username = `${base}${count}`;
    }
  }

  async signUp(dto: SignupDto) {
    const { name, email, phone, department, student_id, password, username } = dto;

    // Check if email already exists
    const { data: emailData, error: emailError } = await this.db.client
      .from('profile')
      .select('id')
      .eq('email', email);

    if (emailError) {
      throw new Error(`Email validation failed: ${emailError.message}`);
    }
    if (emailData && emailData.length > 0) {
      throw new BadRequestException('Email already registered');
    }

    // Check if phone already exists
    const { data: phoneData, error: phoneError } = await this.db.client
      .from('profile')
      .select('id')
      .eq('phone', phone);

    if (phoneError) {
      throw new Error(`Phone validation failed: ${phoneError.message}`);
    }
    if (phoneData && phoneData.length > 0) {
      throw new BadRequestException('Phone number already registered');
    }

    // Determine unique username
    let finalUsername = username;
    if (finalUsername) {
      const { data: usernameData, error: usernameError } = await this.db.client
        .from('profile')
        .select('id')
        .eq('username', finalUsername);

      if (usernameError) {
        throw new Error(`Username validation failed: ${usernameError.message}`);
      }
      if (usernameData && usernameData.length > 0) {
        throw new BadRequestException('Username already taken');
      }
    } else {
      finalUsername = await this.generateUniqueUsername(email);
    }

    // Hash password using Argon2
    const hashedPassword = await argon2.hash(password);

    // Insert user into the profile table
    const { data: newUser, error: insertError } = await this.db.client
      .from('profile')
      .insert([
        {
          name,
          email,
          phone,
          department,
          student_id,
          password: hashedPassword,
          username: finalUsername,
          role: 'student',
        },
      ])
      .select('id, name, avatar, email, phone, department, student_id, role')
      .single();

    if (insertError) {
      throw new BadRequestException(`Failed to create profile: ${insertError.message}`);
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: newUser,
      token,
    };
  }

  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    // Search by email or phone
    const { data, error } = await this.db.client
      .from('profile')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`);

    if (error) {
      throw new Error(`Login query failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException('user not found');
    }

    const user = data[0];

    if (!user.active) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    if (!user.password) {
      throw new BadRequestException('Invalid login credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      this.logger.debug(`Invalid password attempt for user: ${user.email}`);
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
        department: user.department,
        student_id: user.student_id,
        role: user.role,
      },
      token,
    };
  }

  async googleAuth(dto: GoogleAuthDto) {
    const { token: googleToken } = dto;

    let decodedToken;
    try {
      decodedToken = await this.firebase.verifyIdToken(googleToken);
    } catch (e) {
      throw new UnauthorizedException(`Google auth token verification failed: ${e.message}`);
    }

    const googleUid = decodedToken.uid;

    // Check if a profile exists with this Google UID in the google column
    const { data, error } = await this.db.client
      .from('profile')
      .select('*')
      .eq('google', googleUid);

    if (error) {
      throw new Error(`Google login query failed: ${error.message}`);
    }

    if (data && data.length > 0) {
      const user = data[0];

      if (!user.active) {
        throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
      }

      // User exists, login and issue JWT token
      const token = this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          phone: user.phone,
          department: user.department,
          student_id: user.student_id,
          role: user.role,
        },
        token,
      };
    }

    // User does not exist, return signup force info
    throw new NotFoundException({
      statusCode: 404,
      message: 'Google account not registered. Please complete sign up.',
      googleUid,
      email: decodedToken.email,
      name: decodedToken.name,
      requiresSignup: true,
    });
  }

  async googleSignUp(dto: GoogleSignupDto) {
    const { token: googleToken, name, email, phone, department, student_id, username } = dto;

    let decodedToken;
    try {
      decodedToken = await this.firebase.verifyIdToken(googleToken);
    } catch (e) {
      throw new UnauthorizedException(`Google auth token verification failed: ${e.message}`);
    }

    const googleUid = decodedToken.uid;

    // Check if Google UID or email is already registered
    const { data: existingCheck, error: existError } = await this.db.client
      .from('profile')
      .select('*')
      .or(`google.eq.${googleUid},email.eq.${email}`);

    if (existError) {
      throw new Error(`Google signup validation query failed: ${existError.message}`);
    }

    if (existingCheck && existingCheck.length > 0) {
      const matchedUser = existingCheck.find((r) => r.google === googleUid);
      if (matchedUser) {
        if (!matchedUser.active) {
          throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
        }
        // Already registered with this Google account, return login
        const token = this.jwtService.sign({
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
        });

        return {
          user: {
            id: matchedUser.id,
            name: matchedUser.name,
            avatar: matchedUser.avatar,
            email: matchedUser.email,
            phone: matchedUser.phone,
            department: matchedUser.department,
            student_id: matchedUser.student_id,
            role: matchedUser.role,
          },
          token,
        };
      }

      // If email exists but google is empty, link Google UID to it
      const emailUser = existingCheck.find((r) => r.email === email);
      if (emailUser && !emailUser.google) {
        if (!emailUser.active) {
          throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
        }
        const { data: linkedUser, error: updateError } = await this.db.client
          .from('profile')
          .update({ google: googleUid })
          .eq('id', emailUser.id)
          .select('id, name, avatar, email, phone, department, student_id, role')
          .single();

        if (updateError) {
          throw new BadRequestException(`Failed to link Google account: ${updateError.message}`);
        }

        const token = this.jwtService.sign({
          id: linkedUser.id,
          email: linkedUser.email,
          role: linkedUser.role,
        });

        return {
          user: linkedUser,
          token,
        };
      }

      throw new BadRequestException('Email already registered');
    }

    // Check phone uniqueness
    const { data: phoneCheck, error: phoneCheckError } = await this.db.client
      .from('profile')
      .select('id')
      .eq('phone', phone);

    if (phoneCheckError) {
      throw new Error(`Phone validation failed: ${phoneCheckError.message}`);
    }
    if (phoneCheck && phoneCheck.length > 0) {
      throw new BadRequestException('Phone number already registered');
    }

    // Determine unique username
    let finalUsername = username;
    if (finalUsername) {
      const { data: usernameCheck, error: usernameError } = await this.db.client
        .from('profile')
        .select('id')
        .eq('username', finalUsername);

      if (usernameError) {
        throw new Error(`Username validation failed: ${usernameError.message}`);
      }
      if (usernameCheck && usernameCheck.length > 0) {
        throw new BadRequestException('Username already taken');
      }
    } else {
      finalUsername = await this.generateUniqueUsername(email);
    }

    // Create the profile
    const { data: newUser, error: insertError } = await this.db.client
      .from('profile')
      .insert([
        {
          name,
          email,
          phone,
          department,
          student_id,
          google: googleUid,
          username: finalUsername,
          role: 'student',
        },
      ])
      .select('id, name, avatar, email, phone, department, student_id, role')
      .single();

    if (insertError) {
      throw new BadRequestException(`Failed to complete Google registration: ${insertError.message}`);
    }

    const token = this.jwtService.sign({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: newUser,
      token,
    };
  }
}
