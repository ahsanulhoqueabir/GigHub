import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { SelectOption } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import {
  formatFileSize,
  isImageFile,
  pickLocalDocuments,
  StagedFile,
  uploadStagedFilesWithProgress,
} from "@/lib/upload";
import type { CreateJobInput } from "@/lib/validations/job.schema";
import { useCategoriesStore } from "@/store/categories.store";
import { useJobsStore } from "@/store/jobs.store";
import { toast } from "@/store/toast.store";
import type { JobType } from "@/types/db/job.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const JOB_TYPE_OPTIONS: SelectOption[] = [
  { value: "PARTTIME", label: "Part-time" },
  { value: "FULLTIME", label: "Full-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TUTION", label: "Tuition" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "OTHER", label: "Other" },
];

export default function PostJobScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const currentJob = useJobsStore((s) => s.currentJob);
  const isLoadingDetail = useJobsStore((s) => s.isLoadingDetail);
  const fetchJobById = useJobsStore((s) => s.fetchJobById);
  const clearDetail = useJobsStore((s) => s.clearDetail);
  const createJob = useJobsStore((s) => s.createJob);
  const updateJob = useJobsStore((s) => s.updateJob);
  const isMutating = useJobsStore((s) => s.isMutating);

  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const [category, setCategory] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<JobType>("PARTTIME");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [stagedAttachments, setStagedAttachments] = useState<StagedFile[]>([]);

  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categoryOptions: SelectOption[] = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isEditing && id) fetchJobById(id);
    return () => clearDetail();
  }, [id, isEditing, fetchJobById, clearDetail]);

  useEffect(() => {
    if (!isEditing || !currentJob) return;
    setCategory(currentJob.category?.id);
    setTitle(currentJob.title);
    setDescription(currentJob.description);
    setType(currentJob.type);
    setBudget(currentJob.budget ?? "");
    setDeadline(
      currentJob.deadline ? currentJob.deadline.slice(0, 10) : undefined,
    );
    setLocation(currentJob.location ?? "");
    setSkills(currentJob.required_skills ?? []);
    setTags(currentJob.tags ?? []);

    if (currentJob.attachments && currentJob.attachments.length > 0) {
      setStagedAttachments(
        currentJob.attachments.map((url, i) => ({
          id: `remote_${i}_${url}`,
          uri: url,
          name: url.split("/").pop() || `Attachment ${i + 1}`,
          isRemote: true,
        })),
      );
    }
  }, [isEditing, currentJob]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagInput("");
  };

  const handleAddAttachment = async () => {
    try {
      const picked = await pickLocalDocuments(stagedAttachments.length, 5);
      if (picked.length > 0) {
        setStagedAttachments((prev) => [...prev, ...picked]);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRemoveAttachment = (idToRemove: string) => {
    setStagedAttachments((prev) => prev.filter((a) => a.id !== idToRemove));
  };

  const handleSubmit = async () => {
    if (!category) {
      toast.error("Select a category");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!budget.trim()) {
      toast.error("Budget is required");
      return;
    }

    let deadlineIso: string | undefined;
    if (deadline && deadline.trim()) {
      const parsed = new Date(deadline.trim());
      if (isNaN(parsed.getTime())) {
        toast.error("Deadline must be a valid date");
        return;
      }
      deadlineIso = parsed.toISOString();
    }

    try {
      let attachmentUrls: string[] = [];

      if (stagedAttachments.length > 0) {
        setUploadingFiles(true);
        setUploadProgress(0);
        attachmentUrls = await uploadStagedFilesWithProgress(
          stagedAttachments,
          "job-attachments",
          (pct) => setUploadProgress(pct),
        );
      }

      const payload: CreateJobInput = {
        category,
        title: title.trim(),
        description: description.trim(),
        type,
        budget: budget.trim(),
        deadline: deadlineIso,
        location: location.trim() || undefined,
        required_skills: skills.length > 0 ? skills : undefined,
        tags: tags.length > 0 ? tags : undefined,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      };

      if (isEditing && id) {
        await updateJob(id, payload);
        toast.success("Job updated");
      } else {
        await createJob(payload);
        toast.success("Job posted");
      }
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingFiles(false);
    }
  };

  const isLoading = isEditing && isLoadingDetail && !currentJob;
  const isBusy = isMutating || uploadingFiles;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header
        title={isEditing ? "Edit Job" : "Post a Job"}
        showBack
        right={
          <Pressable
            hitSlop={8}
            onPress={handleSubmit}
            disabled={isBusy || isLoading}
          >
            <Text
              className={`text-base font-semibold ${isBusy || isLoading ? "text-gray-400" : "text-primary"}`}
            >
              {uploadingFiles
                ? `${uploadProgress}%`
                : isMutating
                  ? "Saving…"
                  : "Save"}
            </Text>
          </Pressable>
        }
      />

      {isLoading ? null : (
        <ScrollView
          contentContainerClassName="gap-4 px-6 pb-16 pt-6"
          keyboardShouldPersistTaps="handled"
        >
          {uploadingFiles ? (
            <View className="mb-2 rounded-xl bg-primary/10 p-3.5 dark:bg-primary/20 flex-row items-center gap-3">
              <ActivityIndicator color={COLORS.primary} size="small" />
              <View className="flex-1">
                <Text className="text-sm font-medium text-primary">
                  Uploading job attachments...
                </Text>
                <View className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                  <View
                    className="h-full bg-primary"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </View>
              </View>
              <Text className="text-xs font-bold text-primary">
                {uploadProgress}%
              </Text>
            </View>
          ) : null}

          {/* Search Combobox Category Picker */}
          <Combobox
            label="Category"
            placeholder="Search and select a category..."
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />

          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Need a logo designer"
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the job in detail…"
            multiline
            numberOfLines={6}
            className="min-h-32 py-3"
            textAlignVertical="top"
          />

          {/* Custom DatePicker for Deadline */}
          <DatePicker
            label="Deadline (optional)"
            value={deadline}
            onChange={setDeadline}
            placeholder="Select project deadline date"
          />

          {/* Attachments Section */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Attachments (optional)
              </Text>
              <Text className="text-xs text-gray-400">
                {stagedAttachments.length}/5 files
              </Text>
            </View>

            <Text className="text-xs text-gray-400 dark:text-gray-500">
              Any file type allowed. Images max 5MB, other files max 50MB.
            </Text>

            {stagedAttachments.length > 0 ? (
              <View className="gap-2">
                {stagedAttachments.map((file) => {
                  const isImg = isImageFile(file.name, file.mimeType);
                  return (
                    <View
                      key={file.id}
                      className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <View className="flex-1 flex-row items-center gap-2.5 pr-2">
                        <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                          <Ionicons
                            name={
                              isImg ? "image-outline" : "document-text-outline"
                            }
                            size={20}
                            color={COLORS.primary}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            numberOfLines={1}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          >
                            {file.name}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            {file.isRemote
                              ? "Uploaded"
                              : file.size
                                ? formatFileSize(file.size)
                                : "Local file"}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        hitSlop={6}
                        onPress={() => handleRemoveAttachment(file.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#EF4444"
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {stagedAttachments.length < 5 ? (
              <Button
                variant="outline"
                size="sm"
                onPress={handleAddAttachment}
                disabled={isBusy}
                className="mt-1 flex-row items-center justify-center gap-1.5"
              >
                <Ionicons name="attach" size={18} color={COLORS.primary} />
                <Text className="text-xs font-semibold text-primary">
                  Add Attachment File
                </Text>
              </Button>
            ) : null}
          </View>

          <Input
            label="Job Type"
            value={type}
            onChangeText={(v) => setType(v as JobType)}
            placeholder="Select type"
          />

          <Input
            label="Budget"
            value={budget}
            onChangeText={setBudget}
            placeholder="e.g. 5000 or Negotiable"
          />

          <Input
            label="Location (optional)"
            value={location}
            onChangeText={setLocation}
            placeholder="Remote, Dhaka…"
          />

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Required Skills
            </Text>
            {skills.length > 0 ? (
              <View className="mb-2 flex-row flex-wrap gap-2">
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onRemove={() =>
                      setSkills((prev) => prev.filter((s) => s !== skill))
                    }
                  />
                ))}
              </View>
            ) : null}
            <Input
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="Type a skill and press enter"
              onSubmitEditing={addSkill}
              returnKeyType="done"
            />
          </View>

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags
            </Text>
            {tags.length > 0 ? (
              <View className="mb-2 flex-row flex-wrap gap-2">
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onRemove={() =>
                      setTags((prev) => prev.filter((t) => t !== tag))
                    }
                  />
                ))}
              </View>
            ) : null}
            <Input
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Type a tag and press enter"
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
          </View>

          <Button onPress={handleSubmit} isLoading={isBusy} className="mt-2">
            {uploadingFiles
              ? `Uploading attachments (${uploadProgress}%)`
              : isEditing
                ? "Save Changes"
                : "Post Job"}
          </Button>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
