import {Dimensions} from 'react-native';
import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as libraryFp,
} from 'react-native-responsive-dimensions';

const {width, height} = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Custom wrapper around responsiveFontSize to make it scale correctly
// since the layout expects width-based scaling (e.g. size/375 * 100)
// but responsiveFontSize uses diagonal. We can scale it down by the ratio of width to diagonal.
const diagonal = Math.sqrt(width * width + height * height);
const scaleFactor = width / diagonal;

export const fp = (percent: number) => {
  return libraryFp(percent * scaleFactor);
};

export {hp, wp};
