export type CafeMenuItem = {
  id: string;
  category: 'Phin Việt' | 'Espresso Craft' | 'Trà & không cà phê';
  name: string;
  shortDescription: string;
  serving: 'Nóng' | 'Đá' | 'Lạnh';
  recipe: readonly string[];
  notes: string;
};

/**
 * Menu concept for the virtual CaféTrader bar. Quantities are a barista recipe
 * reference, not nutritional, allergen, or food-safety advice.
 */
export const CAFE_MENU: readonly CafeMenuItem[] = [
  {
    id: 'phin-den-da', category: 'Phin Việt', name: 'Cà phê phin đen đá', serving: 'Đá',
    shortDescription: 'Robusta rang vừa, đậm vị cacao và caramel cháy.',
    recipe: ['18 g Robusta xay vừa', '60 ml nước 92–94°C · ủ nở 25 giây', 'Chiết phin 4–5 phút', 'Rót lên ly đầy đá'],
    notes: 'Vị đậm; hợp ngồi gần bar và nhịp trò chuyện nhanh.',
  },
  {
    id: 'sua-da-sai-gon', category: 'Phin Việt', name: 'Cà phê sữa đá Sài Gòn', serving: 'Đá',
    shortDescription: 'Phin đậm hòa cùng sữa đặc, hậu vị kẹo bơ.',
    recipe: ['18 g Robusta xay vừa', '35 ml sữa đặc trong ly', '60 ml cà phê phin nóng', 'Khuấy rồi thêm đá viên lớn'],
    notes: 'Có sữa; barista có thể giảm ngọt khi khách yêu cầu.',
  },
  {
    id: 'bac-xiu', category: 'Phin Việt', name: 'Bạc xỉu ba tầng', serving: 'Đá',
    shortDescription: 'Sữa tươi, sữa đặc và lớp cà phê phin nhẹ.',
    recipe: ['25 ml sữa đặc', '100 ml sữa tươi lạnh', '30 ml cà phê phin', 'Đổ chậm qua đá để giữ ba tầng'],
    notes: 'Có sữa; vị dịu, phù hợp bàn cửa sổ.',
  },
  {
    id: 'ca-phe-trung', category: 'Phin Việt', name: 'Cà phê trứng Hà Nội', serving: 'Nóng',
    shortDescription: 'Kem trứng bông mượt trên nền espresso hoặc phin đậm.',
    recipe: ['1 lòng đỏ trứng đã xử lý an toàn', '15 ml sữa đặc · đánh đến bông mịn', '35 ml espresso hoặc 45 ml phin đậm', 'Ủ ấm cách thủy, rắc bột cacao'],
    notes: 'Có trứng và sữa; phục vụ ngay khi hoàn tất.',
  },
  {
    id: 'espresso-tonic', category: 'Espresso Craft', name: 'Espresso Tonic cam', serving: 'Lạnh',
    shortDescription: 'Sáng vị citrus, đắng thanh và sủi nhẹ.',
    recipe: ['35 ml espresso double shot', '120 ml tonic lạnh', '10 ml syrup cam', 'Đá trong · vỏ cam xoắn'],
    notes: 'Có caffeine; không khuấy mạnh để giữ gas.',
  },
  {
    id: 'flat-white', category: 'Espresso Craft', name: 'Flat White hạt house blend', serving: 'Nóng',
    shortDescription: 'Double shot cân bằng với microfoam mỏng mịn.',
    recipe: ['36 g espresso từ 18 g hạt', '120 ml sữa tươi hấp 55–60°C', 'Rót microfoam thành lớp mỏng', 'Hoàn thiện latte art trái tim'],
    notes: 'Có sữa; house blend thiên hạt và chocolate.',
  },
  {
    id: 'cold-brew-cam-mat', category: 'Espresso Craft', name: 'Cold Brew cam mật', serving: 'Lạnh',
    shortDescription: 'Cold brew ủ chậm, cam tươi và mật ong nhẹ.',
    recipe: ['80 ml cold brew concentrate', '60 ml nước lọc lạnh', '15 ml mật ong', '15 ml nước cam · đá · lát cam'],
    notes: 'Có caffeine; hương sáng, hợp Focus Library.',
  },
  {
    id: 'affogato', category: 'Espresso Craft', name: 'Affogato vanilla', serving: 'Lạnh',
    shortDescription: 'Espresso nóng rót lên kem vanilla mát lạnh.',
    recipe: ['1 viên kem vanilla', '35 ml espresso double shot', 'Rắc hạnh nhân lát tùy chọn', 'Phục vụ trong ly thấp, ăn ngay'],
    notes: 'Có sữa; món tráng miệng, không nên chờ lâu.',
  },
  {
    id: 'matcha-latte', category: 'Trà & không cà phê', name: 'Matcha Latte', serving: 'Nóng',
    shortDescription: 'Matcha xanh thơm, sữa tươi êm và ít ngọt.',
    recipe: ['2 g matcha ceremonial', '35 ml nước 75–80°C', '150 ml sữa tươi hấp', 'Đánh chasen đến mịn rồi rót sữa'],
    notes: 'Có sữa; có thể chọn sữa yến mạch trong bản phục vụ sau.',
  },
  {
    id: 'tra-dao-cam-sa', category: 'Trà & không cà phê', name: 'Trà đào cam sả', serving: 'Đá',
    shortDescription: 'Trà đen, đào, cam và sả thơm mát.',
    recipe: ['120 ml trà đen ủ nguội', '20 ml syrup đào', '1 lát cam · 1 nhánh sả', 'Đá viên lớn, khuấy nhẹ'],
    notes: 'Không sữa; hậu vị trái cây sáng.',
  },
  {
    id: 'cacao-marshmallow', category: 'Trà & không cà phê', name: 'Cacao nóng marshmallow', serving: 'Nóng',
    shortDescription: 'Cacao đậm, sữa ấm và marshmallow mềm.',
    recipe: ['18 g bột cacao nguyên chất', '15 ml syrup đường nâu', '180 ml sữa hấp 60°C', 'Marshmallow và một nhúm muối biển'],
    notes: 'Có sữa; không caffeine tự nhiên từ cà phê.',
  },
  {
    id: 'tra-sen-vang', category: 'Trà & không cà phê', name: 'Trà sen vàng', serving: 'Nóng',
    shortDescription: 'Trà sen thanh, long nhãn và hạt sen.',
    recipe: ['3 g trà sen', '180 ml nước 85°C · ủ 3 phút', 'Long nhãn và hạt sen đã nấu', 'Dùng nóng trong tách sứ'],
    notes: 'Không sữa; nhịp thưởng thức chậm ở Fireside.',
  },
] as const;

export const CAFE_MENU_CATEGORIES = ['Phin Việt', 'Espresso Craft', 'Trà & không cà phê'] as const;

export function menuByCategory(category: CafeMenuItem['category']) {
  return CAFE_MENU.filter((item) => item.category === category);
}
