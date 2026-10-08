import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, CreateProjectInput } from '@taskforge/shared';
import { useProjectMutations } from '../../src/hooks/useMutations';
import { Input } from '../../src/components/Input';
import { Select } from '../../src/components/Select';
import { Button } from '../../src/components/Button';
import { colors, spacing, typography } from '../../src/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate, toISODate } from '../../src/utils/date';

const statusOptions = [
  { label: 'Not Started', value: 'Not Started' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
];

export default function NewProjectScreen() {
  const router = useRouter();
  const { createProject } = useProjectMutations();

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Not Started',
      startDate: undefined,
      endDate: undefined,
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = async (data: CreateProjectInput) => {
    createProject.mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Project Name *"
              placeholder="e.g. Website Redesign"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Description"
              placeholder="High-level project scope and goals"
              multiline
              numberOfLines={3}
              value={value || ''}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.description?.message}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Status"
              value={value}
              options={statusOptions}
              onSelect={onChange}
              error={errors.status?.message}
            />
          )}
        />

        {/* Date Pickers */}
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionLabel}>Project Timeline</Text>
          <View style={styles.dateRow}>
            <View style={styles.datePickerCol}>
              <Text style={styles.pickerSubLabel}>Start Date</Text>
              <Pressable
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateButton}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.steel} />
                <Text style={styles.dateButtonText}>
                  {startDate ? formatDate(startDate) : 'Set start'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.datePickerCol}>
              <Text style={styles.pickerSubLabel}>End Date</Text>
              <Pressable
                onPress={() => setShowEndDatePicker(true)}
                style={[styles.dateButton, errors.endDate && styles.dateButtonError]}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.steel} />
                <Text style={styles.dateButtonText}>
                  {endDate ? formatDate(endDate) : 'Set end'}
                </Text>
              </Pressable>
            </View>
          </View>
          {errors.endDate && (
            <Text style={styles.errorText}>{errors.endDate.message}</Text>
          )}
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate ? new Date(startDate) : new Date()}
            mode="date"
            display="default"
            onChange={(_event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setValue('startDate', toISODate(selectedDate), { shouldValidate: true });
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate ? new Date(endDate) : new Date()}
            mode="date"
            display="default"
            onChange={(_event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setValue('endDate', toISODate(selectedDate), { shouldValidate: true });
              }
            }}
          />
        )}

        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            variant="outline"
            size="md"
            onPress={() => router.back()}
            style={styles.button}
          />
          <Button
            title="Create Project"
            variant="primary"
            size="md"
            onPress={handleSubmit(onSubmit)}
            isLoading={createProject.isPending}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  dateSection: {
    marginBottom: spacing.xl,
  },
  dateSectionLabel: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  datePickerCol: {
    flex: 1,
  },
  pickerSubLabel: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: 4,
    fontSize: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.ash,
    borderRadius: spacing.borderRadius,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
  },
  dateButtonError: {
    borderColor: colors.crimson,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.ink,
    fontSize: 14,
  },
  errorText: {
    ...typography.micro,
    color: colors.crimson,
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
});
