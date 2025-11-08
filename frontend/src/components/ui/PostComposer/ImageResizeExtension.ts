import Image from '@tiptap/extension-image';

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      /**
       * Add an image
       */
      setImage: (options: { src: string; alt?: string; title?: string; width?: string | number; height?: string | number; align?: string }) => ReturnType;
    };
  }
}

export const ImageResize = Image.extend<ImageOptions>({
  name: 'image',
  
  group: 'block',
  
  selectable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      align: {
        default: null,
        parseHTML: element => {
          const align = element.getAttribute('align') || element.style.textAlign || element.style.float;
          return align;
        },
        renderHTML: attributes => {
          if (!attributes.align) {
            return {};
          }
          const align = attributes.align;
          if (align === 'left' || align === 'right') {
            return {
              style: `float: ${align};`,
            };
          }
          if (align === 'center') {
            return {
              style: 'display: block; margin-left: auto; margin-right: auto;',
            };
          }
          return {};
        },
      },
    };
  },

  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});

