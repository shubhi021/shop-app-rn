import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { hp, wp, fp } from '../../theme/dimensions';

interface NotificationItem {
  id: string;
  type: 'order' | 'promo' | 'impact' | 'price' | 'system';
  titleKey: 'notifImpactTitle' | 'notifOrderTitle' | 'notifPromoTitle' | 'notifPriceTitle' | 'notifSystemTitle';
  msgKey: 'notifImpactMsg' | 'notifOrderMsg' | 'notifPromoMsg' | 'notifPriceMsg' | 'notifSystemMsg';
  timeKey: 'notifTime2h' | 'notifTime5h' | 'notifTime1d' | 'notifTime2d' | 'notifTime5d';
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'impact',
    titleKey: 'notifImpactTitle',
    msgKey: 'notifImpactMsg',
    timeKey: 'notifTime2h',
    isRead: false,
  },
  {
    id: '2',
    type: 'order',
    titleKey: 'notifOrderTitle',
    msgKey: 'notifOrderMsg',
    timeKey: 'notifTime5h',
    isRead: false,
  },
  {
    id: '3',
    type: 'promo',
    titleKey: 'notifPromoTitle',
    msgKey: 'notifPromoMsg',
    timeKey: 'notifTime1d',
    isRead: false,
  },
  {
    id: '4',
    type: 'price',
    titleKey: 'notifPriceTitle',
    msgKey: 'notifPriceMsg',
    timeKey: 'notifTime2d',
    isRead: true,
  },
  {
    id: '5',
    type: 'system',
    titleKey: 'notifSystemTitle',
    msgKey: 'notifSystemMsg',
    timeKey: 'notifTime5d',
    isRead: true,
  },
];

export default function NotificationScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, isDark } = useTheme();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Animation values for the whole list load
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'impact':
        return { name: 'leaf', color: '#10B981', bgColor: '#E6FBF3' };
      case 'order':
        return { name: 'cube', color: '#3B82F6', bgColor: '#EFF6FF' };
      case 'promo':
        return { name: 'flash', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'price':
        return { name: 'star', color: '#EC4899', bgColor: '#FDF2F8' };
      case 'system':
      default:
        return { name: 'shield-checkmark', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const renderItem = ({ item, index }: { item: NotificationItem; index: number }) => {
    const iconConfig = getIconConfig(item.type);

    // Staggered animated view for each list item
    const itemFade = new Animated.Value(0);
    const itemSlide = new Animated.Value(15);

    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(itemSlide, {
        toValue: 0,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();

    return (
      <Animated.View
        style={{
          opacity: itemFade,
          transform: [{ translateY: itemSlide }],
        }}
      >
        <TouchableOpacity
          onPress={() => toggleReadStatus(item.id)}
          activeOpacity={0.9}
          style={[
            styles.notificationCard,
            {
              backgroundColor: item.isRead ? colors.card : colors.primary + '0a',
              borderColor: colors.border,
            },
          ]}
        >
          {/* Unread Glow Indicator */}
          {!item.isRead && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />
          )}

          {/* Left Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDark ? '#1F293D' : iconConfig.bgColor,
              },
            ]}
          >
            <Ionicons name={iconConfig.name} size={18} color={isDark ? colors.primary : iconConfig.color} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.textRow}>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontFamily: item.isRead ? fonts.medium : fonts.bold,
                  },
                ]}
                numberOfLines={1}
              >
                {t(item.titleKey)}
              </Text>
              <Text style={[styles.time, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
                {t(item.timeKey)}
              </Text>
            </View>

            <Text
              style={[
                styles.message,
                {
                  color: item.isRead ? colors.textSecondary : colors.text,
                  fontFamily: fonts.regular,
                },
              ]}
            >
              {t(item.msgKey)}
            </Text>
          </View>

          {/* Delete Action button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteNotification(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header Row */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t('notifications')}
          </Text>
        </View>

        {notifications.length > 0 && hasUnread && (
          <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
            <Text style={[styles.markReadText, { color: colors.primary, fontFamily: fonts.semiBold }]}>
              {t('markAllRead')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List content */}
      <Animated.View
        style={[
          styles.listWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              {t('emptyNotificationsTitle')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {t('emptyNotificationsSubtitle')}
            </Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: wp(9.6),
    height: wp(9.6),
    borderRadius: wp(4.8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.2),
  },
  headerTitle: {
    fontSize: fp(4.5),
  },
  markReadText: {
    fontSize: fp(3.47),
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: wp(4.27),
    paddingTop: hp(2.0),
    paddingBottom: hp(4.0),
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4.0),
    borderRadius: wp(4.0),
    borderWidth: 1,
    marginBottom: hp(1.5),
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    left: wp(2.0),
    top: hp(2.0),
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconContainer: {
    width: wp(10.67),
    height: wp(10.67),
    borderRadius: wp(5.33),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.5),
  },
  contentContainer: {
    flex: 1,
    marginRight: wp(2.0),
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  title: {
    fontSize: fp(3.73),
    flex: 1,
    marginRight: wp(2.0),
  },
  time: {
    fontSize: fp(2.93),
  },
  message: {
    fontSize: fp(3.2),
    lineHeight: hp(2.1),
  },
  deleteBtn: {
    padding: wp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10.0),
  },
  emptyIconBg: {
    width: wp(24.0),
    height: wp(24.0),
    borderRadius: wp(12.0),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3.0),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: fp(4.5),
    marginBottom: hp(1.0),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fp(3.47),
    textAlign: 'center',
    lineHeight: hp(2.46),
  },
});
