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
import Ionicons from 'react-native-vector-icons/Ionicons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { PrivacyModal } from '../../components/PrivacyModal';
import { hp, wp, fp } from '../../theme/dimensions';

export default function ProfileScreen({ navigation }: any) {
  const { colors, fontSizes, fontWeights, themeMode, setThemeMode, isDark } = useTheme();
  const { t, language, changeLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(state => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(reduxUser?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

      {/* Theme & Language & Legal Preferences */}
      <View style={[styles.sectionCard, {backgroundColor: colors.card}]}>
        <Text
          style={[
            styles.sectionTitle,
            {color: colors.text, fontWeight: fontWeights.semiBold},
          ]}>
          Preferences & Legal (DE/EU)
        </Text>

        {/* Language Switcher */}
        <View style={styles.settingRow}>
          <View>
            <Text
              style={[
                styles.settingLabel,
                {color: colors.text, fontWeight: fontWeights.medium},
              ]}>
              Language / Sprache
            </Text>
            <Text style={[styles.settingSub, {color: colors.textSecondary}]}>
              {language === 'de' ? 'Deutsch (DE)' : 'English (EN)'}
            </Text>
          </View>
          <View style={styles.langBtnContainer}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                language === 'de' && { backgroundColor: colors.primary },
              ]}
              onPress={() => changeLanguage('de')}>
              <Text
                style={[
                  styles.langBtnText,
                  language === 'de' && { color: '#FFF' },
                ]}>
                DE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.langBtn,
                language === 'en' && { backgroundColor: colors.primary },
              ]}
              onPress={() => changeLanguage('en')}>
              <Text
                style={[
                  styles.langBtnText,
                  language === 'en' && { color: '#FFF' },
                ]}>
                EN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Dark Mode */}
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

        <View style={styles.divider} />

        {/* DSGVO Privacy Settings */}
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => setShowPrivacyModal(true)}>
          <View style={styles.legalLabelRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.text} />
            <Text style={[styles.legalText, { color: colors.text }]}>
              {t('privacySettings')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Impressum Legal Notice */}
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => navigation.navigate('Impressum')}>
          <View style={styles.legalLabelRow}>
            <Ionicons name="document-text-outline" size={18} color={colors.text} />
            <Text style={[styles.legalText, { color: colors.text }]}>
              {t('impressum')} (§ 5 DDG)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
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
        ShopApp DE Showcase v1.0.0 (DSGVO & Eco Ready)
      </Text>

      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: wp(4.27),
    paddingBottom: hp(3.94),
  },
  screenTitle: {
    marginBottom: hp(2.46),
    marginTop: hp(1.23),
  },
  profileCard: {
    alignItems: 'center',
    padding: wp(6.4),
    borderRadius: wp(4.27),
    marginBottom: hp(2.0),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: wp(21.33),
    height: wp(21.33),
    borderRadius: wp(10.67),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2.0),
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: fp(7.47),
  },
  userDetails: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: fp(5.33),
    marginBottom: hp(0.5),
  },
  userEmail: {
    fontSize: fp(3.73),
    marginBottom: hp(2.0),
  },
  editButton: {
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.0),
    borderWidth: 1,
    borderRadius: wp(2.13),
  },
  editForm: {
    width: '100%',
    alignItems: 'center',
  },
  editInput: {
    marginBottom: hp(1.5),
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionBtn: {
    flex: 0.48,
    height: hp(4.9),
  },
  sectionCard: {
    padding: wp(4.27),
    borderRadius: wp(4.27),
    marginBottom: hp(2.0),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: fp(4.27),
    marginBottom: hp(2.0),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: fp(4.0),
  },
  settingSub: {
    fontSize: fp(3.2),
    marginTop: hp(0.25),
  },
  langBtnContainer: {
    flexDirection: 'row',
    gap: wp(1.6),
  },
  langBtn: {
    paddingHorizontal: wp(2.67),
    paddingVertical: hp(0.74),
    borderRadius: wp(1.6),
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  langBtnText: {
    fontSize: fp(3.2),
    fontWeight: '700',
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: hp(1.5),
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.5),
  },
  legalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.13),
  },
  legalText: {
    fontSize: fp(3.73),
    fontWeight: '600',
  },
  spinner: {
    paddingVertical: hp(2.0),
  },
  emptyOrders: {
    paddingVertical: hp(2.96),
    alignItems: 'center',
  },
  emptyOrdersText: {
    fontSize: fp(3.73),
  },
  ordersList: {
    width: '100%',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
  },
  orderId: {
    fontSize: fp(3.73),
  },
  orderDate: {
    fontSize: fp(3.2),
    marginTop: hp(0.25),
  },
  orderTotal: {
    fontSize: fp(3.73),
  },
  signOutBtn: {
    marginTop: hp(1.0),
    marginBottom: hp(2.96),
    height: hp(5.9),
    borderWidth: 1,
  },
  appVersion: {
    textAlign: 'center',
    fontSize: fp(3.2),
  },
});