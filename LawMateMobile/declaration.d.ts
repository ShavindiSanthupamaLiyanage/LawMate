declare module '*.svg' {
  import React from 'react';
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
declare module '*.jpg' {
  const value: any;
  export = value;
}
 
declare module '*.jpeg' {
  const value: any;
  export = value;
}
 
declare module '*.png' {
  const value: any;
  export = value;
}
 
declare module '*.gif' {
  const value: any;
  export = value;
}
 
// declare module 'react-native-vector-icons/Ionicons' {
//   import { Icon } from 'react-native-vector-icons/Icon';
//   const Ionicons: typeof Icon;
//   export default Ionicons;
// }
 
declare module '*.ttf' {
  const src: string;
  export default src;
}
 