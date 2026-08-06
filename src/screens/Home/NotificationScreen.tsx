import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../hooks/useTheme';
import {useTranslation} from '../../hooks/useTranslation';
import {hp, wp, fp} from '../../theme/dimensions';

interface NotificationItem {
  id: string;
  type: 'order' | 'promo' | 'impact' | 'price' | 'system';
  titleKey:
    | 'notifImpactTitle'
    | 'notifOrderTitle'
    | 'notifPromoTitle'
    | 'notifPriceTitle'
    | 'notifSystemTitle';
  msgKey:
    | 'notifImpactMsg'
    | 'notifOrderMsg'
    | 'notifPromoMsg'
    | 'notifPriceMsg'
    | 'notifSystemMsg';
  timeKey:
    | 'notifTime2h'
    | 'notifTime5h'
    | 'notifTime1d'
    | 'notifTime2d'
    | 'notifTime5d';
  isRead: boolean;
  group: 'today' | 'earlier';
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'impact',
    titleKey: 'notifImpactTitle',
    msgKey: 'notifImpactMsg',
    timeKey: 'notifTime2h',
    isRead: false,
    group: 'today',
  },
  {
    id: '2',
    type: 'order',
    titleKey: 'notifOrderTitle',
    msgKey: 'notifOrderMsg',
    timeKey: 'notifTime5h',
    isRead: false,
    group: 'today',
  },
  {
    id: '3',
    type: 'promo',
    titleKey: 'notifPromoTitle',
    msgKey: 'notifPromoMsg',
    timeKey: 'notifTime1d',
    isRead: false,
    group: 'today',
  },
  {
    id: '4',
    type: 'price',
    titleKey: 'notifPriceTitle',
    msgKey: 'notifPriceMsg',
    timeKey: 'notifTime2d',
    isRead: true,
    group: 'earlier',
  },
  {
    id: '5',
    type: 'system',
    titleKey: 'notifSystemTitle',
    msgKey: 'notifSystemMsg',
    timeKey: 'notifTime5d',
    isRead: true,
    group: 'earlier',
  },
];

type FilterOption = 'all' | 'order' | 'promo' | 'impact' | 'price' | 'system';

const FILTER_OPTIONS: {key: FilterOption; label: string; icon: string}[] = [
  {key: 'all', label: 'All', icon: 'apps-outline'},
  {key: 'order', label: 'Orders', icon: 'cube-outline'},
  {key: 'promo', label: 'Promos', icon: 'flash-outline'},
  {key: 'impact', label: 'Impact', icon: 'leaf-outline'},
];

export default function NotificationScreen({navigation}: any) {
  const {colors, fonts, fontSizes, isDark} = useTheme();
  const {t} = useTranslation();
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

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

  const filtered = useMemo(() => {
    if (activeFilter === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const todayItems = filtered.filter(n => n.group === 'today');
  const earlierItems = filtered.filter(n => n.group === 'earlier');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({...item, isRead: true})));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(prev =>
      prev.map(item =>
        item.id === id ? {...item, isRead: !item.isRead} : item,
      ),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (activeFilter === 'all') {
      setNotifications([]);
    } else {
      setNotifications(prev => prev.filter(n => n.type !== activeFilter));
    }
  };

  const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'impact':
        return {name: 'leaf', color: '#10B981', bgColor: '#E6FBF3'};
      case 'order':
        return {name: 'cube', color: '#3B82F6', bgColor: '#EFF6FF'};
      case 'promo':
        return {name: 'flash', color: '#F59E0B', bgColor: '#FEF3C7'};
      case 'price':
        return {name: 'star', color: '#EC4899', bgColor: '#FDF2F8'};
      default:
        return {name: 'shield-checkmark', color: '#6B7280', bgColor: '#F3F4F6'};
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => {
    const iconConfig = getIconConfig(item.type);
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
        style={{opacity: itemFade, transform: [{translateY: itemSlide}]}}>
        <TouchableOpacity
          onPress={() => toggleReadStatus(item.id)}
          activeOpacity={0.9}
          style={[
            styles.notificationCard,
            {
              backgroundColor: item.isRead
                ? colors.card
                : colors.primary + '0a',
              borderColor: item.isRead ? colors.border : colors.primary + '30',
            },
          ]}>
          {!item.isRead && (
            <View
              style={[styles.unreadBadge, {backgroundColor: colors.primary}]}
            />
          )}

          <View
            style={[
              styles.iconContainer,
              {backgroundColor: isDark ? '#1F293D' : iconConfig.bgColor},
            ]}>
            <Ionicons
              name={iconConfig.name as any}
              size={18}
              color={isDark ? colors.primary : iconConfig.color}
            />
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.textRow}>
              <Text
                style={[
                  styles.notifTitle,
                  {
                    color: colors.text,
                    fontFamily: item.isRead ? fonts.medium : fonts.bold,
                  },
                ]}
                numberOfLines={1}>
                {t(item.titleKey)}
              </Text>
              <Text
                style={[
                  styles.time,
                  {color: colors.textTertiary, fontFamily: fonts.regular},
                ]}>
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
              ]}>
              {t(item.msgKey)}
            </Text>

            {/* Action chips for specific types */}
            {item.type === 'order' && !item.isRead && (
              <View
                style={[
                  styles.actionChip,
                  {backgroundColor: colors.primary + '15'},
                ]}>
                <Text
                  style={[
                    styles.actionChipText,
                    {color: colors.primary, fontFamily: fonts.semiBold},
                  ]}>
                  Track Order →
                </Text>
              </View>
            )}
            {item.type === 'promo' && !item.isRead && (
              <View style={[styles.actionChip, {backgroundColor: '#F59E0B18'}]}>
                <Text
                  style={[
                    styles.actionChipText,
                    {color: '#D97706', fontFamily: fonts.semiBold},
                  ]}>
                  Shop Now →
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteNotification(item.id)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons
              name="trash-outline"
              size={16}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderGroupSection = (title: string, items: NotificationItem[]) => {
    if (items.length === 0) {
      return null;
    }
    return (
      <>
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionHeaderText,
              {color: colors.textTertiary, fontFamily: fonts.semiBold},
            ]}>
            {title}
          </Text>
          <View
            style={[styles.sectionHeaderLine, {backgroundColor: colors.border}]}
          />
        </View>
        {items.map((item, index) => renderItem({item, index}))}
      </>
    );
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* ── Header ── */}
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.backBtn, {borderColor: colors.border}]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text
              style={[
                styles.headerTitle,
                {color: colors.text, fontFamily: fonts.bold},
              ]}>
              {t('notifications')}
            </Text>
            {unreadCount > 0 && (
              <Text
                style={[
                  styles.unreadLabel,
                  {color: colors.primary, fontFamily: fonts.medium},
                ]}>
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={clearAll}
              activeOpacity={0.7}
              style={styles.headerActionBtn}>
              <Text
                style={[
                  styles.actionText,
                  {color: '#EF4444', fontFamily: fonts.medium},
                ]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
          {hasUnread && (
            <TouchableOpacity
              onPress={markAllAsRead}
              activeOpacity={0.7}
              style={styles.headerActionBtn}>
              <Text
                style={[
                  styles.markReadText,
                  {color: colors.primary, fontFamily: fonts.semiBold},
                ]}>
                {t('markAllRead')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Chips ── */}
      <View
        style={[
          styles.filterBar,
          {borderBottomColor: colors.border, borderBottomWidth: 1},
        ]}>
        {FILTER_OPTIONS.map(opt => {
          const count =
            opt.key === 'all'
              ? notifications.length
              : notifications.filter(n => n.type === opt.key).length;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setActiveFilter(opt.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === opt.key ? colors.primary : colors.card,
                  borderColor:
                    activeFilter === opt.key ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.8}>
              <Ionicons
                name={opt.icon as any}
                size={13}
                color={activeFilter === opt.key ? '#FFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      activeFilter === opt.key ? '#FFF' : colors.textSecondary,
                    fontFamily:
                      activeFilter === opt.key ? fonts.semiBold : fonts.regular,
                  },
                ]}>
                {opt.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterCount,
                    {
                      backgroundColor:
                        activeFilter === opt.key ? '#FFFFFF30' : colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterCountText,
                      {
                        color:
                          activeFilter === opt.key
                            ? '#FFF'
                            : colors.textSecondary,
                        fontFamily: fonts.bold,
                      },
                    ]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List Content ── */}
      <Animated.View
        style={[
          styles.listWrapper,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        {filtered.length > 0 ? (
          <FlatList
            data={[]}
            keyExtractor={() => ''}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                {renderGroupSection('Today', todayItems)}
                {renderGroupSection('Earlier', earlierItems)}
              </>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconBg,
                {backgroundColor: colors.card, borderColor: colors.border},
              ]}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                {color: colors.text, fontFamily: fonts.bold},
              ]}>
              {t('emptyNotificationsTitle')}
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                {color: colors.textSecondary, fontFamily: fonts.regular},
              ]}>
              {activeFilter === 'all'
                ? t('emptyNotificationsSubtitle')
                : `No ${activeFilter} notifications.`}
            </Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {
    width: wp(9.6),
    height: wp(9.6),
    borderRadius: wp(4.8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.2),
  },
  headerTitle: {fontSize: fp(4.5)},
  unreadLabel: {fontSize: fp(3.0), marginTop: hp(0.2)},
  headerActions: {flexDirection: 'row', gap: wp(3.0)},
  headerActionBtn: {},
  actionText: {fontSize: fp(3.47)},
  markReadText: {fontSize: fp(3.47)},
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.2),
    gap: wp(2.5),
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    paddingHorizontal: wp(3.0),
    paddingVertical: hp(0.8),
    borderRadius: wp(4.0),
    borderWidth: 1,
  },
  filterChipText: {fontSize: fp(3.0)},
  filterCount: {
    paddingHorizontal: wp(1.5),
    paddingVertical: 1,
    borderRadius: wp(2.0),
    minWidth: wp(4.5),
    alignItems: 'center',
  },
  filterCountText: {fontSize: fp(2.67)},
  listWrapper: {flex: 1},
  listContent: {
    paddingHorizontal: wp(4.27),
    paddingTop: hp(1.5),
    paddingBottom: hp(4.0),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3.0),
    marginBottom: hp(1.5),
    marginTop: hp(0.5),
  },
  sectionHeaderText: {
    fontSize: fp(3.2),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionHeaderLine: {flex: 1, height: 1},
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    flexShrink: 0,
  },
  contentContainer: {flex: 1, marginRight: wp(2.0)},
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  notifTitle: {fontSize: fp(3.73), flex: 1, marginRight: wp(2.0)},
  time: {fontSize: fp(2.93)},
  message: {fontSize: fp(3.2), lineHeight: hp(2.1)},
  actionChip: {
    alignSelf: 'flex-start',
    marginTop: hp(0.8),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(2.0),
  },
  actionChipText: {fontSize: fp(3.0)},
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
    marginTop: hp(10),
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
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {fontSize: fp(4.5), marginBottom: hp(1.0), textAlign: 'center'},
  emptySubtitle: {
    fontSize: fp(3.47),
    textAlign: 'center',
    lineHeight: hp(2.46),
  },
});
