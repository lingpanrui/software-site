'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type NativeImgProps = React.ComponentPropsWithoutRef<'img'>;

export interface ImageProps extends NativeImgProps {}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      width,
      height,
      sizes,
      srcSet,
      className,
      loading = 'lazy',
      decoding = 'async',
      ...rest
    },
    ref,
  ) => {
    return (
      <img
        {...rest}
        ref={ref}
        src={src}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
        className={cn(
          'bg-linear-to-b from-gray-50/20 to-gray-200/20',
          className,
        )}
        loading={loading}
        decoding={decoding}
      />
    );
  },
);

Image.displayName = 'Image';

export default Image;
