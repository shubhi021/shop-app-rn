import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db } from '../../services/firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../store/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { hp, wp, fp } from '../../theme/dimensions';

export default function OrderHistoryScreen({ navigation }: any) {
  const { colors, fonts, isDark } = useTheme();
  const { formatCurrency } = useTranslation();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [reduxUser]);

  const fetchOrders = async () => {
    if (!reduxUser?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', reduxUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetched);
    } catch (e) {
      console.log('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={64} color={colors.border} style={{ marginBottom: hp(2.0) }} />
      <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold }]}>No Orders Yet</Text>
      <Text style={[styles.emptySub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
        Looks like you haven't made any purchases yet.
      </Text>
      <TouchableOpacity
        style={[styles.shopBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.shopBtnText, { fontFamily: fonts.bold }]}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchOrders}
          renderItem={({ item: order }) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity style={styles.orderHeader} onPress={() => toggleExpand(order.id)} activeOpacity={0.8}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={[styles.orderId, { color: colors.text, fontFamily: fonts.semiBold }]}>
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </Text>
                    <Text style={[styles.orderDate, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.orderHeaderRight}>
                    <Text style={[styles.orderTotal, { color: colors.primary, fontFamily: fonts.bold }]}>
                      {formatCurrency(order.total || 0)}
                    </Text>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.orderItemsContainer, { borderTopColor: colors.border }]}>
                    {order.items?.map((item: any, idx: number) => (
                      <View key={idx} style={styles.orderItem}>
                        <View style={[styles.itemImageContainer, { borderColor: colors.border }]}>
                          {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                          ) : (
                            <Ionicons name="image-outline" size={20} color={colors.border} />
                          )}
                        </View>
                        <View style={styles.itemDetails}>
                          <Text style={[styles.itemTitle, { color: colors.text, fontFamily: fonts.medium }]} numberOfLines={2}>
                            {item.title}
                          </Text>
                          <Text style={[styles.itemQty, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                            Qty: {item.quantity} x {formatCurrency(item.price)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
  },
  backBtn: { padding: wp(1.0) },
  headerTitle: { fontSize: fp(4.27) },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: wp(4.27), paddingBottom: hp(10.0) },
  orderCard: {
    borderWidth: 1,
    borderRadius: wp(4.0),
    marginBottom: hp(2.0),
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4.0),
  },
  orderHeaderLeft: { flex: 1 },
  orderId: { fontSize: fp(3.73), marginBottom: hp(0.3) },
  orderDate: { fontSize: fp(3.2) },
  orderHeaderRight: { alignItems: 'flex-end', gap: hp(0.5) },
  orderTotal: { fontSize: fp(4.0) },
  orderItemsContainer: {
    padding: wp(4.0),
    borderTopWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
    gap: wp(3.0),
  },
  itemImageContainer: {
    width: wp(12.0),
    height: wp(12.0),
    borderRadius: wp(2.0),
    borderWidth: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: { width: '90%', height: '90%' },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: fp(3.47), marginBottom: hp(0.3) },
  itemQty: { fontSize: fp(3.2) },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10.0),
  },
  emptyTitle: { fontSize: fp(4.53), marginBottom: hp(1.0) },
  emptySub: { fontSize: fp(3.47), textAlign: 'center', marginBottom: hp(3.0) },
  shopBtn: {
    paddingHorizontal: wp(8.0),
    paddingVertical: hp(1.5),
    borderRadius: wp(5.0),
  },
  shopBtnText: { color: '#FFF', fontSize: fp(3.73) },
});
