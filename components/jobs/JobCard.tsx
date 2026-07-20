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

interface JobCardProps {
  job: JobListItem;
  width?: number;
}

export function JobCard({ job, width }: JobCardProps) {
  const deadline = formatDeadline(job.deadline);
  const isTuition = job.type === "TUTION";

  return (
    <Pressable
      onPress={() => router.push(`/job/${job.slug}`)}
      style={width ? { width } : undefined}
      className={`gap-2.5 rounded-2xl p-4 active:opacity-90 ${
        isTuition
          ? "border-2 border-warning/60 bg-amber-50/40 dark:border-warning/70 dark:bg-amber-950/20"
          : "border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1.5">
          <Badge variant={TYPE_VARIANTS[job.type]}>
            {TYPE_LABELS[job.type]}
          </Badge>
          {isTuition ? (
            <View className="flex-row items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 border border-warning/30">
              <Ionicons name="school" size={11} color={COLORS.warning} />
              <Text className="text-[10px] font-bold text-warning">
                Special
              </Text>
            </View>
          ) : null}
        </View>
        {job.budget ? (
          <Text
            className={`font-bold ${isTuition ? "text-base text-primary dark:text-green-400" : "text-sm text-gray-900 dark:text-gray-100"}`}
          >
            {CURRENCY_SYMBOL} {job.budget}
          </Text>
        ) : null}
      </View>

      <Text
        numberOfLines={2}
        className="text-[15px] font-semibold leading-5 text-gray-900 dark:text-gray-100"
      >
        {job.title}
      </Text>
      <Text
        numberOfLines={2}
        className="text-xs leading-4 text-gray-500 dark:text-gray-400"
      >
        {job.description}
      </Text>

      {job.required_skills && job.required_skills.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {job.required_skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant={isTuition ? "warning" : "default"}>
              {skill}
            </Badge>
          ))}
        </View>
      ) : null}

      <View
        className={`mt-1 flex-row items-center justify-between border-t pt-2.5 ${isTuition ? "border-amber-200/70 dark:border-amber-900/40" : "border-gray-100 dark:border-gray-800"}`}
      >
        <View className="flex-row items-center gap-1.5">
          <Avatar uri={job.owner.avatar} name={job.owner.name} size="sm" />
          <Text
            numberOfLines={1}
            className="max-w-28 text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            {job.owner.name}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {job.location ? (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="location-outline"
                size={12}
                color={isTuition ? COLORS.warning : COLORS.gray400}
              />
              <Text
                numberOfLines={1}
                className={`max-w-20 text-[11px] ${isTuition ? "font-medium text-amber-900 dark:text-amber-300" : "text-gray-400 dark:text-gray-500"}`}
              >
                {job.location}
              </Text>
            </View>
          ) : null}
          {deadline ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color={COLORS.gray400} />
              <Text className="text-[11px] text-gray-400 dark:text-gray-500">
                {deadline}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
