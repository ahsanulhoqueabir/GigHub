import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { IconMessageCircle, IconUser } from "@tabler/icons-react";
import Link from "next/link";

interface ProfileInfo {
  id: string;
  name: string;
  username: string;
  avatar?: string | null;
}

interface OrderProfileCardProps {
  label: "Buyer" | "Seller";
  profile: ProfileInfo;
  orderId?: string;
}

export function OrderProfileCard({
  label,
  profile,
  orderId,
}: OrderProfileCardProps) {
  const { user } = useAuthStore();
  const isMe = user?.id === profile.id;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <IconUser className="size-4 text-muted-foreground" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {profile.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm truncate">{profile.name}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              @{profile.username}
            </p>
          </div>
        </div>

        {orderId && !isMe && (
          <div className="mt-4 pt-3 border-t">
            <Button asChild className="w-full gap-2 cursor-pointer">
              <Link href={`/chat?orderId=${orderId}`}>
                <IconMessageCircle className="size-4" />
                Chat with {label}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
