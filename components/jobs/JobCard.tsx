import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { COLORS } from "@/constants/colors";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import type { JobListItem, JobType } from "@/types/db/job.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

const TYPE_LABELS: Record<JobType, string> = {
  PARTTIME: "Part-time",
  FULLTIME: "Full-time",
  CONTRACT: "Contract",
  TUTION: "Tuition",
  VOLUNTEER: "Volunteer",
  OTHER: "Other",
};

const TYPE_VARIANTS: Record<JobType, BadgeVariant> = {
  PARTTIME: "info",
  FULLTIME: "success",
  CONTRACT: "warning",
  TUTION: "warning",
  VOLUNTEER: "default",
  OTHER: "default",
};

function formatDeadline(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export interface JobCardProps {
  job: JobListItem;
  width?: number;
}

/**
 * Dedicated Card Layout for Tuition / Tutoring Listings
 */
export function TuitionJobCard({ job, width }: JobCardProps) {
  const deadline = formatDeadline(job.deadline);

  return (
    <Pressable
      onPress={() => router.push(`/job/${job.slug}`)}
      style={width ? { width } : undefined}
      className="relative overflow-hidden gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 active:opacity-90 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm"
    >
      {/* Absolute Watermark Icon */}
      <View className="absolute -top-3 -left-3 pointer-events-none opacity-10 dark:opacity-20">
        <Ionicons name="school" size={96} color={COLORS.warning} />
      </View>

      {/* Header: Badge & Remuneration */}
      <View className="flex-row items-center justify-end gap-2">
        {/* <View className="rounded-full bg-amber-500/15 px-2.5 py-1 border border-amber-500/30">
          <Text className="text-xs font-bold text-amber-800 dark:text-amber-300">
            Tuition
          </Text>
        </View> */}

        {job.budget ? (
          <View className="rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
            <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {CURRENCY_SYMBOL} {job.budget}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Content: Title & Description */}
      <View className="gap-1">
        <Text
          numberOfLines={2}
          className="text-base font-bold leading-6 text-gray-900 dark:text-gray-100"
        >
          {job.title}
        </Text>
        <Text
          numberOfLines={3}
          className="text-sm leading-5 text-amber-950/70 dark:text-amber-200/70"
        >
          {job.description}
        </Text>
      </View>

      {/* Required Subjects / Skills */}
      {job.required_skills && job.required_skills.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {job.required_skills.slice(0, 3).map((skill) => (
            <View
              key={skill}
              className="rounded-lg bg-amber-100/90 px-2.5 py-0.5 border border-amber-200/60 dark:bg-amber-900/40 dark:border-amber-800/40"
            >
              <Text className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                {skill}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Footer: Poster Avatar & Meta Info */}
      <View className="mt-0.5 flex-row items-center justify-between border-t border-amber-200/70 pt-2.5 dark:border-amber-900/40">
        <View className="flex-row items-center gap-1.5 flex-1 pr-2">
          <Avatar uri={job.owner.avatar} name={job.owner.name} size="sm" />
          <Text
            numberOfLines={1}
            className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            {job.owner.name}
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          {job.location ? (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="location-outline"
                size={12}
                color={COLORS.warning}
              />
              <Text
                numberOfLines={1}
                className="max-w-[80px] text-xs font-medium text-amber-900 dark:text-amber-300"
              >
                {job.location}
              </Text>
            </View>
          ) : null}
          {deadline ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color={COLORS.gray500} />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {deadline}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Standard Card Layout for Regular Jobs (Full-time, Part-time, Contract, etc.)
 */
export function StandardJobCard({ job, width }: JobCardProps) {
  const deadline = formatDeadline(job.deadline);

  return (
    <Pressable
      onPress={() => router.push(`/job/${job.slug}`)}
      style={width ? { width } : undefined}
      className="gap-3 rounded-2xl border border-gray-100 bg-white p-4 active:opacity-90 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm"
    >
      {/* Header: Type Badge & Budget */}
      <View className="flex-row items-center justify-between gap-2">
        <Badge variant={TYPE_VARIANTS[job.type]}>{TYPE_LABELS[job.type]}</Badge>
        {job.budget ? (
          <Text className="text-sm font-bold text-primary dark:text-emerald-400">
            {CURRENCY_SYMBOL} {job.budget}
          </Text>
        ) : null}
      </View>

      {/* Content: Title & Description */}
      <View className="gap-1">
        <Text
          numberOfLines={2}
          className="text-base font-bold leading-6 text-gray-900 dark:text-gray-100"
        >
          {job.title}
        </Text>
        <Text
          numberOfLines={3}
          className="text-sm leading-5 text-gray-600 dark:text-gray-400"
        >
          {job.description}
        </Text>
      </View>

      {/* Required Skills */}
      {job.required_skills && job.required_skills.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {job.required_skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="default">
              {skill}
            </Badge>
          ))}
        </View>
      ) : null}

      {/* Footer: Poster & Meta */}
      <View className="mt-0.5 flex-row items-center justify-between border-t border-gray-100 pt-2.5 dark:border-gray-800">
        <View className="flex-row items-center gap-1.5 flex-1 pr-2">
          <Avatar uri={job.owner.avatar} name={job.owner.name} size="sm" />
          <Text
            numberOfLines={1}
            className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            {job.owner.name}
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          {job.location ? (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="location-outline"
                size={12}
                color={COLORS.gray400}
              />
              <Text
                numberOfLines={1}
                className="max-w-[80px] text-xs text-gray-500 dark:text-gray-400"
              >
                {job.location}
              </Text>
            </View>
          ) : null}
          {deadline ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color={COLORS.gray400} />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {deadline}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Main JobCard component dispatcher
 */
export function JobCard(props: JobCardProps) {
  if (props.job.type === "TUTION") {
    return <TuitionJobCard {...props} />;
  }
  return <StandardJobCard {...props} />;
}
