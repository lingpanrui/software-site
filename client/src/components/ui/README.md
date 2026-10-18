# shadcn/ui 组件开发指南

## 核心原则

- 组件位置：`/src/components/ui/`
- 图标库：必须使用 `lucide-react`，禁用 Emoji
- 交互系统：Button、Badge 使用 elevate 遮罩系统处理 hover/active 状态（通过 `::after` 伪元素叠加 `--elevate-1` / `--elevate-2`）

## 关键组件规范

### Button 组件

```tsx
import { Button } from '@/components/ui/button';

<Button variant="secondary">标准按钮</Button>
```

### Badge 组件

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>默认</Badge>
<Badge variant="secondary">次要</Badge>
<Badge variant="outline">边框</Badge>
<Badge variant="destructive">危险</Badge>
```

### Empty 组件

```tsx
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';

<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <SearchIcon className="size-6" />
    </EmptyMedia>
    <EmptyTitle>暂无数据</EmptyTitle>
    <EmptyDescription>当前没有找到相关内容</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>添加数据</Button>
  </EmptyContent>
</Empty>
```

### Card Padding 系统

- `CardHeader`: `p-6`
- `CardContent`: `p-6 pt-0`
- `CardFooter`: `p-6 pt-0`

### Dialog 组件

Dialog 默认提供了右上角的 close 能力，通过设置 `showCloseButton={false}` 关闭默认关闭按钮。

### Image 组件

支持原生 `<img>` 标签所有属性。响应式图片必须设置 `sizes`，固定尺寸必须设置 `width`（number 类型）。
