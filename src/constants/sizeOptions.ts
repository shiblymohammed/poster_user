export interface SizeOption {
  id: string;
  name: string;
  ratio: string;
  width: number;
  height: number;
  description: string;
  icon: string;
  aspectRatio: number;
}

export const SIZE_OPTIONS: SizeOption[] = [
  {
    id: 'instagram_post',
    name: 'Instagram Post',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    description: 'Square Instagram post',
    icon: '📷',
    aspectRatio: 1 / 1
  },
  {
    id: 'instagram_story',
    name: 'Instagram Story',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Stories and Reels',
    icon: '📲',
    aspectRatio: 9 / 16
  },
  {
    id: 'whatsapp_dp',
    name: 'WhatsApp DP',
    ratio: '1:1',
    width: 500,
    height: 500,
    description: 'WhatsApp display picture',
    icon: '💬',
    aspectRatio: 1 / 1
  }
];

export const getDefaultSize = (): SizeOption => SIZE_OPTIONS[0]; // Instagram Post
