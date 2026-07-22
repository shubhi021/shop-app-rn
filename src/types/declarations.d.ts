declare module 'react-native-vector-icons/Ionicons' {
    import { Component } from 'react';
    import { TextProps, TextStyle, ViewStyle } from 'react-native';

    export interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
        style?: TextStyle | ViewStyle;
    }

    export default class Ionicons extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/*' {
    import { Component } from 'react';
    import { TextProps, TextStyle, ViewStyle } from 'react-native';

    export interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
        style?: TextStyle | ViewStyle;
    }

    export default class Icon extends Component<IconProps> { }
}
