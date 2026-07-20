import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Combobox } from "@/components/ui/Combobox";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { SelectOption } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import {
  pickLocalImages,
  StagedFile,
  uploadStagedFilesWithProgress,
} from "@/lib/upload";
import type { CreateGigInput } from "@/lib/validations/gig.schema";
import { useCategoriesStore } from "@/store/categories.store";
import { useGigsStore } from "@/store/gigs.store";
import { toast } from "@/store/toast.store";
import type { FAQ, GigPackage, GIGPackageTier } from "@/types/db/gig.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const TIERS: GIGPackageTier[] = ["BASIC", "STANDARD", "PREMIUM"];

const FAQ_SUGGESTIONS = [
  "Do you provide source files?",
  "What is your turnaround time?",
  "Can I request extra revisions?",
  "What format files will I receive?",
];

function emptyPackage(tier: GIGPackageTier): GigPackage {
  return {
    tier,
    title: "",
    description: "",
    price: undefined,
    delivery_days: undefined,
    revisions: undefined,
    features: [],
  };
}

export default function CreateGigScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const currentGig = useGigsStore((s) => s.currentGig);
  const isLoadingDetail = useGigsStore((s) => s.isLoadingDetail);
  const fetchGigById = useGigsStore((s) => s.fetchGigById);
  const clearDetail = useGigsStore((s) => s.clearDetail);
  const createGig = useGigsStore((s) => s.createGig);
  const updateGig = useGigsStore((s) => s.updateGig);
  const isMutating = useGigsStore((s) => s.isMutating);

  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const [category, setCategory] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stagedImages, setStagedImages] = useState<StagedFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [packages, setPackages] = useState<GigPackage[]>(
    TIERS.map(emptyPackage),
  );
  const [activeTier, setActiveTier] = useState<GIGPackageTier>("BASIC");
  const [featureInput, setFeatureInput] = useState("");

  const [faq, setFaq] = useState<FAQ[]>([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const categoryOptions: SelectOption[] = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isEditing && id) fetchGigById(id);
    return () => clearDetail();
  }, [id, isEditing, fetchGigById, clearDetail]);

  useEffect(() => {
    if (!isEditing || !currentGig) return;
    setCategory(currentGig.category?.id);
    setTitle(currentGig.title);
    setDescription(currentGig.description);

    if (currentGig.images && currentGig.images.length > 0) {
      setStagedImages(
        currentGig.images.map((url, idx) => ({
          id: `remote_${idx}_${url}`,
          uri: url,
          name: `Gig Image ${idx + 1}`,
          isRemote: true,
        })),
      );
    }

    setTags(currentGig.tags ?? []);
    setPackages(
      TIERS.map(
        (tier) =>
          currentGig.packages.find((p) => p.tier === tier) ??
          emptyPackage(tier),
      ),
    );
    setFaq(currentGig.faq ?? []);
  }, [isEditing, currentGig]);

  const activePackage = packages.find((p) => p.tier === activeTier)!;

  const updatePackage = (tier: GIGPackageTier, patch: Partial<GigPackage>) => {
    setPackages((prev) =>
      prev.map((p) => (p.tier === tier ? { ...p, ...patch } : p)),
    );
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    const currentFeatures = activePackage.features ?? [];
    updatePackage(activeTier, { features: [...currentFeatures, trimmed] });
    setFeatureInput("");
  };

  const removeFeature = (indexToRemove: number) => {
    const currentFeatures = activePackage.features ?? [];
    updatePackage(activeTier, {
      features: currentFeatures.filter((_, idx) => idx !== indexToRemove),
    });
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

  const handlePickImages = async () => {
    try {
      const newImages = await pickLocalImages(stagedImages.length, 8);
      if (newImages.length > 0) {
        setStagedImages((prev) => [...prev, ...newImages]);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRemoveImage = (idToRemove: string) => {
    setStagedImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const saveFaqItem = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error("Enter both question and answer");
      return;
    }

    const newItem: FAQ = {
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
    };

    if (editingFaqIndex !== null) {
      setFaq((prev) =>
        prev.map((item, idx) => (idx === editingFaqIndex ? newItem : item)),
      );
      setEditingFaqIndex(null);
    } else {
      setFaq((prev) => [...prev, newItem]);
    }

    setFaqQuestion("");
    setFaqAnswer("");
  };

  const editFaq = (index: number) => {
    const target = faq[index];
    if (!target) return;
    setFaqQuestion(target.question);
    setFaqAnswer(target.answer);
    setEditingFaqIndex(index);
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
    for (const pkg of packages) {
      if (!pkg.title.trim() || !pkg.description.trim()) {
        toast.error(
          `Complete the ${pkg.tier.toLowerCase()} package title & description`,
        );
        return;
      }
    }

    try {
      let imageUrls: string[] = [];

      if (stagedImages.length > 0) {
        setUploadingImages(true);
        setUploadProgress(0);
        imageUrls = await uploadStagedFilesWithProgress(
          stagedImages,
          "gigs",
          (pct) => setUploadProgress(pct),
        );
      }

      const payload: CreateGigInput = {
        category,
        title: title.trim(),
        description: description.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        tags: tags.length > 0 ? tags : undefined,
        packages: packages.map((p) => ({
          title: p.title.trim(),
          tier: p.tier,
          description: p.description.trim(),
          price: p.price,
          delivery_days: p.delivery_days,
          revisions: p.revisions,
          features:
            p.features && p.features.length > 0 ? p.features : undefined,
        })) as CreateGigInput["packages"],
        faq: faq.length > 0 ? faq : undefined,
      };

      if (isEditing && id) {
        await updateGig(id, payload);
        toast.success("Gig updated");
      } else {
        await createGig(payload);
        toast.success("Gig created");
      }
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingImages(false);
    }
  };

  const isLoading = isEditing && isLoadingDetail && !currentGig;
  const isBusy = isMutating || uploadingImages;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header
        title={isEditing ? "Edit Gig" : "Create a Gig"}
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
              {uploadingImages
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
          {uploadingImages ? (
            <View className="mb-2 rounded-xl bg-primary/10 p-3.5 dark:bg-primary/20 flex-row items-center gap-3">
              <ActivityIndicator color={COLORS.primary} size="small" />
              <View className="flex-1">
                <Text className="text-sm font-medium text-primary">
                  Uploading gig images...
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
            placeholder="e.g. I will design a modern logo"
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your service in detail…"
            multiline
            numberOfLines={6}
            className="min-h-32 py-3"
            textAlignVertical="top"
          />

          {/* ── Multiple Image Upload Section ───────────────────────────── */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Gig Portfolio Images
              </Text>
              <Text className="text-xs font-medium text-primary">
                ({stagedImages.length} / 8 selected)
              </Text>
            </View>

            {/* Dropzone Upload Button */}
            {stagedImages.length < 8 ? (
              <Pressable
                onPress={handlePickImages}
                disabled={isBusy}
                className="items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 py-5 dark:border-primary/40 dark:bg-primary/10 active:opacity-75"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <Ionicons
                    name="cloud-upload-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                </View>
                <Text className="mt-2 text-sm font-semibold text-primary">
                  Tap to Select Images
                </Text>
                <Text className="mt-0.5 text-xs text-gray-400">
                  Select multiple images (PNG, JPG, WebP. Max 5MB each)
                </Text>
              </Pressable>
            ) : null}

            {/* Image Grid Staging Preview */}
            {stagedImages.length > 0 ? (
              <View className="mt-1 flex-row flex-wrap gap-3">
                {stagedImages.map((file, idx) => (
                  <View
                    key={file.id}
                    className="relative h-24 w-[31%] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <Image
                      source={{ uri: file.uri }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />

                    {/* Cover Photo Badge for 1st image */}
                    {idx === 0 ? (
                      <View className="absolute left-1 top-1 rounded-md bg-primary/90 px-1.5 py-0.5">
                        <Text className="text-[9px] font-bold text-white">
                          ★ Cover
                        </Text>
                      </View>
                    ) : (
                      <View className="absolute left-1 top-1 rounded-md bg-black/60 px-1.5 py-0.5">
                        <Text className="text-[9px] font-medium text-white">
                          #{idx + 1}
                        </Text>
                      </View>
                    )}

                    {/* Remove Action */}
                    <Pressable
                      onPress={() => handleRemoveImage(file.id)}
                      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/70 active:opacity-70"
                    >
                      <Ionicons name="close" size={14} color="#FFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
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

          {/* ── Packages ─────────────────────────────────────────── */}
          <Text className="mt-2 text-[15px] font-semibold text-gray-900 dark:text-gray-100">
            Packages
          </Text>
          <View className="flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
            {TIERS.map((tier) => (
              <View key={tier} className="flex-1">
                <Text
                  onPress={() => setActiveTier(tier)}
                  className={`rounded-lg py-2 text-center text-xs font-semibold capitalize ${
                    activeTier === tier
                      ? "bg-white text-primary dark:bg-gray-800"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {tier.toLowerCase()}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
            <Input
              label="Package Title"
              value={activePackage.title}
              onChangeText={(v) => updatePackage(activeTier, { title: v })}
              placeholder="e.g. Basic Logo Design"
            />
            <Input
              label="Package Description"
              value={activePackage.description}
              onChangeText={(v) =>
                updatePackage(activeTier, { description: v })
              }
              placeholder="What's included in this package…"
              multiline
              numberOfLines={3}
              className="min-h-20 py-3"
              textAlignVertical="top"
            />
            <View className="flex-row gap-3">
              <Input
                containerClassName="flex-1"
                label="Price"
                value={
                  activePackage.price != null ? String(activePackage.price) : ""
                }
                onChangeText={(v) =>
                  updatePackage(activeTier, {
                    price: v ? Number(v.replace(/[^0-9.]/g, "")) : undefined,
                  })
                }
                placeholder="0"
                keyboardType="numeric"
              />
              <Input
                containerClassName="flex-1"
                label="Delivery Days"
                value={
                  activePackage.delivery_days != null
                    ? String(activePackage.delivery_days)
                    : ""
                }
                onChangeText={(v) =>
                  updatePackage(activeTier, {
                    delivery_days: v
                      ? Number(v.replace(/[^0-9]/g, ""))
                      : undefined,
                  })
                }
                placeholder="3"
                keyboardType="numeric"
              />
              <Input
                containerClassName="flex-1"
                label="Revisions"
                value={
                  activePackage.revisions != null
                    ? String(activePackage.revisions)
                    : ""
                }
                onChangeText={(v) =>
                  updatePackage(activeTier, {
                    revisions: v ? Number(v.replace(/[^0-9]/g, "")) : undefined,
                  })
                }
                placeholder="2"
                keyboardType="numeric"
              />
            </View>

            {/* ── Features List Section ───────────────────────────── */}
            <View className="gap-2 pt-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Included Features ({activePackage.features?.length || 0})
                </Text>
              </View>

              {/* Vertical List of Features */}
              {activePackage.features && activePackage.features.length > 0 ? (
                <View className="gap-2">
                  {activePackage.features.map((feature, fIdx) => (
                    <View
                      key={`${feature}-${fIdx}`}
                      className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <View className="flex-1 flex-row items-center gap-2.5 pr-2">
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={COLORS.primary}
                        />
                        <Text className="text-sm text-gray-800 dark:text-gray-200">
                          {feature}
                        </Text>
                      </View>
                      <Pressable
                        hitSlop={6}
                        onPress={() => removeFeature(fIdx)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#EF4444"
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-gray-400">
                  No features added to this package yet.
                </Text>
              )}

              {/* Add Feature Input Row */}
              <View className="flex-row items-center gap-2 pt-1">
                <View className="flex-1">
                  <Input
                    value={featureInput}
                    onChangeText={setFeatureInput}
                    placeholder="Type feature (e.g., Vector Source File)"
                    onSubmitEditing={addFeature}
                    returnKeyType="done"
                  />
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={addFeature}
                  className="py-3 px-3.5"
                >
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </Button>
              </View>
            </View>
          </View>

          {/* ── FAQ Section (Enhanced Accordion Card Approach) ────── */}
          <View className="mt-2 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                Frequently Asked Questions ({faq.length})
              </Text>
            </View>

            {/* Accordion FAQ Preview List */}
            {faq.length > 0 ? (
              <View className="gap-2.5">
                {faq.map((item, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <View
                      key={`${item.question}-${idx}`}
                      className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50"
                    >
                      <Pressable
                        onPress={() =>
                          setExpandedFaqIndex(isExpanded ? null : idx)
                        }
                        className="flex-row items-center justify-between"
                      >
                        <View className="flex-1 flex-row items-center gap-2 pr-2">
                          <Ionicons
                            name="help-circle-outline"
                            size={18}
                            color={COLORS.primary}
                          />
                          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">
                            {item.question}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <Pressable hitSlop={6} onPress={() => editFaq(idx)}>
                            <Ionicons
                              name="create-outline"
                              size={16}
                              color="#4B5563"
                            />
                          </Pressable>
                          <Pressable
                            hitSlop={6}
                            onPress={() =>
                              setFaq((prev) => prev.filter((_, i) => i !== idx))
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color="#EF4444"
                            />
                          </Pressable>
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={16}
                            color="#9CA3AF"
                          />
                        </View>
                      </Pressable>

                      {isExpanded ? (
                        <View className="mt-2.5 border-t border-gray-200/60 pt-2.5 dark:border-gray-800">
                          <Text className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                            {item.answer}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* Quick Prompt Suggestions */}
            <View className="gap-1.5 pt-1">
              <Text className="text-xs font-semibold text-gray-400">
                Quick Prompt Suggestions:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2"
              >
                {FAQ_SUGGESTIONS.map((sug) => (
                  <Pressable
                    key={sug}
                    onPress={() => setFaqQuestion(sug)}
                    className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800 active:opacity-70"
                  >
                    <Text className="text-xs text-gray-700 dark:text-gray-300">
                      + {sug}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Add / Edit FAQ Editor Box */}
            <View className="gap-2.5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <Text className="text-xs font-semibold text-gray-500">
                {editingFaqIndex !== null
                  ? "Edit FAQ Item"
                  : "Add New FAQ Item"}
              </Text>
              <Input
                value={faqQuestion}
                onChangeText={setFaqQuestion}
                placeholder="Question (e.g. Do you provide source files?)"
              />
              <Input
                value={faqAnswer}
                onChangeText={setFaqAnswer}
                placeholder="Answer details..."
                multiline
                numberOfLines={3}
                className="min-h-20 py-2.5"
                textAlignVertical="top"
              />
              <View className="flex-row items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={saveFaqItem}
                  className="flex-1"
                >
                  {editingFaqIndex !== null
                    ? "Update FAQ Item"
                    : "Save FAQ Item"}
                </Button>
                {editingFaqIndex !== null ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      setEditingFaqIndex(null);
                      setFaqQuestion("");
                      setFaqAnswer("");
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </View>
            </View>
          </View>

          <Button onPress={handleSubmit} isLoading={isBusy} className="mt-3">
            {uploadingImages
              ? `Uploading images (${uploadProgress}%)`
              : isEditing
                ? "Save Changes"
                : "Publish Gig"}
          </Button>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
