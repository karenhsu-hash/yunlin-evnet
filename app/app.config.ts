export default defineAppConfig({
  ui: {
    // 對應主視覺色票：主色磚紅、中性色用暖灰以貼合紙感底
    colors: {
      primary: 'vermilion',
      secondary: 'sky',
      success: 'moss',
      warning: 'marigold',
      error: 'vermilion',
      neutral: 'stone'
    },
    button: {
      defaultVariants: { size: 'md' }
    }
  }
})
