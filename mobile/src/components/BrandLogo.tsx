import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  layout?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export function BrandLogo({
  size = 'md',
  showText = true,
  showTagline = false,
  layout = 'vertical',
  style,
}: BrandLogoProps) {
  const imageSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  const borderRadii = {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
  };

  const imgSize = imageSizes[size];
  const radius = borderRadii[size];

  const isHorizontal = layout === 'horizontal';

  return (
    <View
      style={[
        styles.container,
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
        style,
      ]}
    >
      <View
        style={[
          styles.imageWrapper,
          {
            width: imgSize,
            height: imgSize,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={require('../../assets/taskora-logo.png')}
          style={[
            styles.image,
            {
              width: imgSize,
              height: imgSize,
              borderRadius: radius,
            },
          ]}
          resizeMode="cover"
        />
      </View>

      {showText && (
        <View style={isHorizontal ? styles.textContainerHorizontal : styles.textContainerVertical}>
          <Text
            style={[
              size === 'sm' ? styles.titleSm : size === 'xl' ? styles.titleXl : styles.titleMd,
            ]}
          >
            Taskora
          </Text>
          {showTagline && (
            <Text style={styles.tagline}>Plan. Track. Achieve.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageWrapper: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.ash,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainerHorizontal: {
    justifyContent: 'center',
  },
  textContainerVertical: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  titleSm: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  titleMd: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  titleXl: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
