import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {EcoScoreBadge} from '../EcoScoreBadge';
import {hp, wp, fp} from '../../theme/dimensions';
import {useTheme} from '../../hooks/useTheme';
import {useTranslation} from '../../hooks/useTranslation';

interface CartItemCardProps {
  item: any;
  onIncrement: (id: number, qty: number) => void;
  onDecrement: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onSaveForLater: (item: any) => void;
}

const CartItemCard = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onSaveForLater,
}: CartItemCardProps) => {
  const {colors, fonts} = useTheme();
  const {formatCurrency} = useTranslation();
  const {product, quantity} = item;

  return (
    <View
      style={[
        styles.itemRow,
        {backgroundColor: colors.card, borderColor: colors.border},
      ]}>
      <View style={styles.itemImageCard}>
        <Image
          source={{uri: product.image}}
          style={styles.itemImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeaderRow}>
          <Text
            style={[
              styles.itemCategory,
              {color: colors.textSecondary, fontFamily: fonts.medium},
            ]}
            numberOfLines={1}>
            {product.category.toUpperCase()}
          </Text>
          <TouchableOpacity
            onPress={() => onRemove(product.id)}
            style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.itemTitle,
            {color: colors.text, fontFamily: fonts.semiBold},
          ]}
          numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.ecoScoreContainer}>
          <EcoScoreBadge
            score={product.ecoScore || (product.id % 2 === 0 ? 'A' : 'B')}
            co2Grams={product.co2Grams || Math.round(product.price * 25)}
            hasPfand={
              product.hasPfand || product.category?.includes('beverage')
            }
            size="small"
          />
        </View>

        <Text
          style={[
            styles.itemPrice,
            {color: colors.primary, fontFamily: fonts.bold},
          ]}>
          {formatCurrency(product.price)}
        </Text>

        <View style={styles.itemBottomRow}>
          <View style={[styles.qtySelector, {borderColor: colors.border}]}>
            <TouchableOpacity
              onPress={() => onDecrement(product.id, quantity)}
              style={styles.qtyBtn}>
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text
              style={[
                styles.qtyText,
                {color: colors.text, fontFamily: fonts.bold},
              ]}>
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => onIncrement(product.id, quantity)}
              style={styles.qtyBtn}>
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.itemSubtotal,
              {color: colors.text, fontFamily: fonts.semiBold},
            ]}>
            {formatCurrency(product.price * quantity)}
          </Text>
        </View>

        {/* Save for Later */}
        <TouchableOpacity
          onPress={() => onSaveForLater(item)}
          style={styles.saveForLaterBtn}
          activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={13} color={colors.primary} />
          <Text
            style={[
              styles.saveForLaterText,
              {color: colors.primary, fontFamily: fonts.medium},
            ]}>
            Save for Later
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(CartItemCard);

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    marginHorizontal: wp(4.27),
    marginBottom: hp(2.0),
    borderRadius: wp(4.27),
    borderWidth: 1,
    padding: wp(3.2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemImageCard: {
    width: wp(24.0),
    height: hp(12.31),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3.2),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(2.13),
  },
  itemImage: {width: '100%', height: '100%'},
  itemInfo: {flex: 1, marginLeft: wp(4.27), justifyContent: 'space-between'},
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {fontSize: fp(2.4), letterSpacing: 0.5, flex: 1},
  removeBtn: {padding: wp(1.07)},
  itemTitle: {fontSize: fp(3.47), marginBottom: hp(0.5), lineHeight: hp(2.3)},
  ecoScoreContainer: {marginVertical: hp(0.5)},
  itemPrice: {fontSize: fp(4.0), marginBottom: hp(1.0)},
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp(2.13),
    height: hp(3.94),
    width: wp(26.67),
  },
  qtyBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {width: wp(8.53), textAlign: 'center', fontSize: fp(3.47)},
  itemSubtotal: {fontSize: fp(3.47)},
  saveForLaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginTop: hp(0.8),
  },
  saveForLaterText: {fontSize: fp(3.0)},
});
