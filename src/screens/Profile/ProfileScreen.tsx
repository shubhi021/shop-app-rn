import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import {signOut, updateProfile} from 'firebase/auth';
import {collection, query, where, getDocs, orderBy} from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import {auth, db} from '../../services/firebase';
import {useTheme} from '../../hooks/useTheme';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {setUser} from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {formatPrice} from '../../utils/formatPrice';

export default function ProfileScreen() {
  const {colors, fontSizes, fontWeights, themeMode, setThemeMode, isDark} =
    useTheme();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(state => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(reduxUser?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [reduxUser]);

  const fetchOrders = async () => {
    if (!reduxUser?.uid) return;
    setOrdersLoading(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', reduxUser.uid),
        orderBy('createdAt', 'desc'),
      );
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetched);
    } catch (e) {
      console.log('Firestore orders empty or unconfigured: ', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            dispatch(setUser(null));
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'See you next time!',
            });
          } catch (err: any) {
            Toast.show({
              type: 'error',
              text1: 'Sign Out Error',
              text2: err.message,
            });
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Name cannot be empty.',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
        dispatch(
          setUser({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: displayName.trim(),
            photoURL: auth.currentUser.photoURL,
          }),
        );
        setIsEditing(false);
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Display name updated successfully.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Profile Update Failed',
        text2: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const name = reduxUser?.displayName || '';
    const email = reduxUser?.email || '';
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <Text
        style={[
          styles.screenTitle,
          {
            color: colors.text,
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.bold,
          },
        ]}>
        My Profile
      </Text>

      {/* User Card */}
      <View style={[styles.profileCard, {backgroundColor: colors.card}]}>
        <View style={[styles.avatar, {backgroundColor: colors.primary}]}>
          <Text style={[styles.avatarText, {fontWeight: fontWeights.bold}]}>
            {getInitials()}
          </Text>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Input
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Edit your name"
              autoCapitalize="words"
              style={styles.editInput}
            />
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setDisplayName(reduxUser?.displayName || '');
                  setIsEditing(false);
                }}
                variant="outline"
                style={styles.actionBtn}
              />
              <Button
                title="Save"
                onPress={handleSaveProfile}
                loading={isSaving}
                style={styles.actionBtn}
              />
            </View>
          </View>
        ) : (
          <View style={styles.userDetails}>
            <Text
              style={[
                styles.userName,
                {color: colors.text, fontWeight: fontWeights.semiBold},
              ]}>
              {reduxUser?.displayName || 'User'}
            </Text>
            <Text style={[styles.userEmail, {color: colors.textSecondary}]}>
              {reduxUser?.email || ''}
            </Text>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={[styles.editButton, {borderColor: colors.border}]}>
              <Text style={{color: colors.primary, fontWeight: fontWeights.bold}}>
                Edit Name
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Theme Setting */}
      <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
        <Text
          style={[
            styles.sectionTitle,
            {color: colors.text, fontWeight: fontWeights.semiBold},
          ]}>
          Preferences
        </Text>
        <View style={styles.settingRow}>
          <View>
            <Text
              style={[
                styles.settingLabel,
                {color: colors.text, fontWeight: fontWeights.medium},
              ]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingSub, {color: colors.textSecondary}]}>
              {themeMode === 'system'
                ? 'Following device preferences'
                : `Manually set to ${themeMode}`}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={value => {
              setThemeMode(value ? 'dark' : 'light');
            }}
            trackColor={{false: colors.border, true: colors.primary}}
            thumbColor={Platform.OS === 'android' ? colors.background : ''}
          />
        </View>
        {themeMode !== 'system' && (
          <TouchableOpacity
            style={styles.resetThemeBtn}
            onPress={() => setThemeMode('system')}>
            <Text style={{color: colors.primary, fontSize: fontSizes.sm}}>
              Follow System Theme Settings
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Order History */}
      <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
        <Text
          style={[
            styles.sectionTitle,
            {color: colors.text, fontWeight: fontWeights.semiBold},
          ]}>
          Order History
        </Text>

        {ordersLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.spinner}
          />
        ) : orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Text style={[styles.emptyOrdersText, {color: colors.textTertiary}]}>
              No orders placed yet.
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order, idx) => (
              <View
                key={order.id || idx}
                style={[
                  styles.orderRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx === orders.length - 1 ? 0 : 0.5,
                  },
                ]}>
                <View>
                  <Text
                    style={[
                      styles.orderId,
                      {color: colors.text, fontWeight: fontWeights.medium},
                    ]}>
                    Order #{order.id?.substring(0, 8).toUpperCase() || 'N/A'}
                  </Text>
                  <Text style={[styles.orderDate, {color: colors.textSecondary}]}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : ''}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.orderTotal,
                    {color: colors.text, fontWeight: fontWeights.bold},
                  ]}>
                  {formatPrice(order.total || 0)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        style={[styles.signOutBtn, {borderColor: colors.error}]}
        textStyle={{color: colors.error}}
      />

      <Text style={[styles.appVersion, {color: colors.textTertiary}]}>
        ShopApp v1.0.0 (Build 1)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    marginBottom: 20,
    marginTop: 10,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  userDetails: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  editForm: {
    width: '100%',
    alignItems: 'center',
  },
  editInput: {
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionBtn: {
    flex: 0.48,
    height: 40,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  resetThemeBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  spinner: {
    paddingVertical: 16,
  },
  emptyOrders: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyOrdersText: {
    fontSize: 14,
  },
  ordersList: {
    width: '100%',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderId: {
    fontSize: 14,
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 14,
  },
  signOutBtn: {
    marginTop: 8,
    marginBottom: 24,
    height: 48,
    borderWidth: 1,
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 12,
  },
});