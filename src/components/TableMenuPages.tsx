import { useEffect, useState } from 'react';
import { CAFE_MENU, CAFE_MENU_CATEGORIES, type CafeMenuItem } from '../data/cafeMenu';
import './TableMenuPages.css';

type Props = {
  suggestedItemId?: string;
  disabled: boolean;
  isSeated?: boolean;
  onOrder: (item: CafeMenuItem) => void;
};

export default function TableMenuPages({ suggestedItemId, disabled, isSeated, onOrder }: Props) {
  const initialItem = CAFE_MENU.find((item) => item.id === suggestedItemId) ?? CAFE_MENU[0];
  const [activeCategory, setActiveCategory] = useState<CafeMenuItem['category']>(initialItem.category);
  const [activeId, setActiveId] = useState(initialItem.id);

  useEffect(() => {
    const nextItem = CAFE_MENU.find((item) => item.id === suggestedItemId);
    if (nextItem) {
      setActiveCategory(nextItem.category);
      setActiveId(nextItem.id);
    }
  }, [suggestedItemId]);

  const pageItems = CAFE_MENU.filter((item) => item.category === activeCategory);
  const activeItem = CAFE_MENU.find((item) => item.id === activeId) ?? pageItems[0];

  return (
    <section className="table-menu-pages" aria-label="Trang thực đơn tại bàn">
      <div className="table-menu-pages__header">
        <span>✦ MENU TẠI BÀN</span>
        <small>Trang {CAFE_MENU_CATEGORIES.indexOf(activeCategory) + 1}/{CAFE_MENU_CATEGORIES.length}</small>
      </div>
      <div className="table-menu-pages__tabs" role="tablist" aria-label="Nhóm đồ uống">
        {CAFE_MENU_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => { setActiveCategory(category); setActiveId(CAFE_MENU.find((item) => item.category === category)?.id ?? activeId); }}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="table-menu-pages__spread">
        <div className="table-menu-pages__list">
          {pageItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeItem.id ? 'active' : ''}
              onClick={() => setActiveId(item.id)}
            >
              <strong>{item.name}</strong><small>{item.serving} · {item.shortDescription}</small>
            </button>
          ))}
        </div>
        <article className="table-menu-pages__recipe">
          <span>{activeItem.category} · {activeItem.serving}</span>
          <h4>{activeItem.name}</h4>
          <p>{activeItem.shortDescription}</p>
          <ol>{activeItem.recipe.map((step) => <li key={step}>{step}</li>)}</ol>
          <small>{activeItem.notes}</small>
          <button type="button" disabled={disabled} onClick={() => onOrder(activeItem)}>
            {disabled
              ? '⏳ Barista đang pha chế...'
              : isSeated
                ? `☕ Gọi ${activeItem.name} (Tại bàn)`
                : `☕ Gọi ${activeItem.name} (Mang đi)`}
          </button>
        </article>
      </div>
    </section>
  );
}
