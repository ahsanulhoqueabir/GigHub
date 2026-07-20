import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { useAuthStore } from "@/store/auth.store";
import { useFileUploadStore } from "@/store/file-upload.store";
import { useJobProposalsStore } from "@/store/job-proposals.store";
import { useJobsStore } from "@/store/jobs.store";
import { toast } from "@/store/toast.store";
import type { JobType } from "@/types/db/job.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_ATTACHMENTS = 5;


function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobDetailScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();


  const job = useJobsStore((s) => s.currentJob);
  const isLoading = useJobsStore((s) => s.isLoadingDetail);
  const fetchJobBySlug = useJobsStore((s) => s.fetchJobBySlug);
  const clearDetail = useJobsStore((s) => s.clearDetail);

  const createProposal = useJobProposalsStore((s) => s.createProposal);
  const isCreating = useJobProposalsStore((s) => s.isCreating);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);

  const uploadingFiles = useFileUploadStore((s) => s.uploadingFiles);
  const pickAndUploadDocuments = useFileUploadStore(
    (s) => s.pickAndUploadDocuments,
  );
  const removeFile = useFileUploadStore((s) => s.removeFile);
  const resetFiles = useFileUploadStore((s) => s.reset);
  const [isPickingFiles, setIsPickingFiles] = useState(false);

  const [applyVisible, setApplyVisible] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    if (slug) fetchJobBySlug(slug);
    return () => clearDetail();
  }, [slug, fetchJobBySlug, clearDetail]);

  const handleApplyPress = () => {
    if (!isAuthenticated) {
      toast.warning("You must log in first to apply for this job!");
      router.push("/(auth)/login");
      return;
    }
    resetFiles();
    setApplyVisible(true);
  };

  const isUploadingFiles = uploadingFiles.some((f) => !f.publicUrl && !f.error);

  const handleAddFiles = async () => {
    try {
      setIsPickingFiles(true);
      await pickAndUploadDocuments({
        folder: "job-proposals",
        maxFiles: MAX_ATTACHMENTS,
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsPickingFiles(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!job) return;
    if (!coverLetter.trim()) {
      toast.error("Write a short cover letter");
      return;
    }
    if (isUploadingFiles) {
      toast.error("Please wait for attachments to finish uploading");
      return;
    }

    const attachments = uploadingFiles
      .map((f) => f.publicUrl)
      .filter((url): url is string => !!url);

    try {
      await createProposal({
        job: job.id,
        description: coverLetter.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      toast.success("Proposal submitted");
      setApplyVisible(false);
      setCoverLetter("");
      resetFiles();
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading || !job) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Job" showBack />
        <View className="gap-4 p-6">
          <Skeleton height={22} width="70%" />
          <Skeleton height={14} width="40%" />
          <Skeleton height={120} rounded="lg" />
        </View>
      </View>
    );
  }

  const isOwner = user?.id === job.owner.id;

  const isTuition = job.type === "TUTION";

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Job Details" showBack />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: (isOwner ? 24 : 85) + Math.max(insets.bottom, 16),
        }}
        contentContainerClassName="gap-4 px-6 py-5"
      >
        {isTuition ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/80 p-3 dark:bg-amber-950/30 dark:border-amber-900/50">
            <Ionicons name="school" size={20} color={COLORS.warning} />
            <View className="flex-1">
              <Text className="text-xs font-bold text-warning">
                Tuition - Special Category
              </Text>
              <Text className="text-[11px] text-amber-800 dark:text-amber-300">
                Verified academic post with priority support
              </Text>
            </View>
          </View>
        ) : null}

        <View className="flex-row items-start justify-between gap-2">
          <Badge variant={TYPE_VARIANTS[job.type]}>
            {TYPE_LABELS[job.type]}
          </Badge>
          {job.budget ? (
            <Text
              className={`text-lg font-bold ${isTuition ? "text-primary dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}
            >
              {CURRENCY_SYMBOL} {job.budget}
            </Text>
          ) : (
            <Text className="text-sm font-medium text-gray-400">
              Negotiable
            </Text>
          )}
        </View>

        <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {job.title}
        </Text>

        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
          {job.location ? (
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="location-outline"
                size={14}
                color={isTuition ? COLORS.warning : COLORS.gray400}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {job.location}
              </Text>
            </View>
          ) : null}
          {job.deadline ? (
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.gray400}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Apply by {formatDate(job.deadline)}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="eye-outline" size={14} color={COLORS.gray400} />
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {job.views} views
            </Text>
          </View>
        </View>

        {/* Owner card */}
        <View className="flex-row items-center gap-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
          <Avatar uri={job.owner.avatar} name={job.owner.name} size="md" />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                {job.owner.name}
              </Text>
              {job.owner.verified ? (
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={COLORS.primary}
                />
              ) : null}
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              @{job.owner.username}
            </Text>
          </View>
        </View>

        <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
          Description
        </Text>
        <Text className="leading-5 text-gray-600 dark:text-gray-300">
          {job.description}
        </Text>

        {job.required_skills && job.required_skills.length > 0 ? (
          <View>
            <Text className="mb-2 text-[15px] font-semibold text-gray-900 dark:text-gray-100">
              Required Skills
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {job.required_skills.map((skill) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </View>
          </View>
        ) : null}

        {job.tags && job.tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="info">
                {tag}
              </Badge>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {!isOwner ? (
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-6 pt-4 dark:border-gray-800 dark:bg-gray-950"
        >
          <Button onPress={handleApplyPress}>Apply for this Job</Button>
        </View>
      ) : null}

      <Modal
        visible={applyVisible}
        onClose={() => setApplyVisible(false)}
        title="Submit Proposal"
      >
        <View className="gap-4 pb-4">
          <View className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Applying for
            </Text>
            <Text className="font-semibold text-gray-900 dark:text-gray-100">
              {job.title}
            </Text>
          </View>

          <Input
            label="Cover Letter"
            value={coverLetter}
            onChangeText={setCoverLetter}
            placeholder="Tell the poster why you're a great fit…"
            multiline
            numberOfLines={5}
            className="min-h-28 py-3"
            textAlignVertical="top"
          />

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments (CV / Resume, optional)
            </Text>

            {uploadingFiles.length > 0 ? (
              <View className="mb-2 gap-2">
                {uploadingFiles.map((file) => (
                  <View
                    key={file.id}
                    className="flex-row items-center gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5 dark:border-gray-700"
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={COLORS.gray500}
                    />
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm text-gray-800 dark:text-gray-200"
                      >
                        {file.name}
                      </Text>
                      {file.error ? (
                        <Text className="text-xs text-red-500">
                          {file.error}
                        </Text>
                      ) : (
                        <Text className="text-xs text-gray-400 dark:text-gray-500">
                          {file.publicUrl
                            ? "Uploaded"
                            : `Uploading… ${file.progress}%`}
                          {file.size ? ` · ${formatFileSize(file.size)}` : ""}
                        </Text>
                      )}
                    </View>
                    {!file.publicUrl && !file.error ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Pressable
                        hitSlop={8}
                        onPress={() => removeFile(file.id)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color={COLORS.gray400}
                        />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            ) : null}

            {uploadingFiles.length < MAX_ATTACHMENTS ? (
              <Pressable
                onPress={handleAddFiles}
                disabled={isPickingFiles}
                className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 active:bg-gray-50 dark:border-gray-700 dark:active:bg-gray-900"
              >
                {isPickingFiles ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons
                    name="attach-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                )}
                <Text className="text-sm font-medium text-primary">
                  Add File
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Button
            onPress={handleSubmitProposal}
            isLoading={isCreating || isUploadingFiles}
          >
            Submit Proposal
          </Button>
        </View>
      </Modal>
    </View>
  );
}
