import { useUserManagement } from '../UserManagementProvider';

type StyleObject = Record<string, string | number | undefined>;
type StyleFunction<T> = (props: T) => StyleObject;

/**
 * Hook for platform-specific styling
 * 
 * Usage:
 * 
 * const styles = usePlatformStyles({
 *   base: { 
 *     padding: '1rem',
 *     margin: '0.5rem'
 *   },
 *   web: { 
 *     borderRadius: '0.5rem',
 *   },
 *   ios: { 
 *     shadowRadius: 3,
 *     shadowOpacity: 0.2
 *   },
 *   android: { 
 *     elevation: 3
 *   }
 * });
 */
export function usePlatformStyles<T = {}>(
  options: {
    base?: StyleObject | StyleFunction<T>;
    web?: StyleObject | StyleFunction<T>;
    ios?: StyleObject | StyleFunction<T>;
    android?: StyleObject | StyleFunction<T>;
    mobile?: StyleObject | StyleFunction<T>; // Applied to ios & android
    native?: StyleObject | StyleFunction<T>; // Applied to all native platforms
  }, 
  props?: T
): StyleObject {
  const { platform, isNative } = useUserManagement();
  
  // Initialize with base styles
  const styles: StyleObject = {};
  
  // Helper to apply styles based on type
  const applyStyles = (styleSource?: StyleObject | StyleFunction<T>) => {
    if (!styleSource) return;
    
    const styleObj = typeof styleSource === 'function' 
      ? (styleSource as StyleFunction<T>)(props || {} as T)
      : styleSource;
      
    Object.assign(styles, styleObj);
  };
  
  // Apply base styles first
  applyStyles(options.base);
  
  // Apply native styles if applicable
  if (isNative) {
    applyStyles(options.native);
  }
  
  // Apply mobile styles if this is a mobile platform
  if (platform === 'ios' || platform === 'android') {
    applyStyles(options.mobile);
  }
  
  // Apply platform-specific styles
  switch (platform) {
    case 'web':
      applyStyles(options.web);
      break;
    case 'ios':
      applyStyles(options.ios);
      break;
    case 'android':
      applyStyles(options.android);
      break;
    // react-native uses native & mobile styles
  }
  
  return styles;
}

/**
 * Helper to create platform-specific class names
 * 
 * Usage:
 * 
 * const className = getPlatformClasses({
 *   base: 'p-4 m-2',
 *   web: 'rounded-lg shadow-md',
 *   mobile: 'rounded-sm',
 *   ios: 'bg-blue-50',
 *   android: 'bg-blue-100'
 * });
 */
export function getPlatformClasses(
  options: {
    base?: string;
    web?: string;
    ios?: string;
    android?: string;
    mobile?: string;
    native?: string;
  }
): string {
  const { platform, isNative } = useUserManagement();
  
  const classes: string[] = [];
  
  // Add base classes
  if (options.base) {
    classes.push(options.base);
  }
  
  // Add native classes if applicable
  if (isNative && options.native) {
    classes.push(options.native);
  }
  
  // Add mobile classes if this is a mobile platform
  if ((platform === 'ios' || platform === 'android') && options.mobile) {
    classes.push(options.mobile);
  }
  
  // Add platform-specific classes
  switch (platform) {
    case 'web':
      if (options.web) classes.push(options.web);
      break;
    case 'ios':
      if (options.ios) classes.push(options.ios);
      break;
    case 'android':
      if (options.android) classes.push(options.android);
      break;
  }
  
  return classes.join(' ');
} 