import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import type { LanguageCode, PromotionalBanner } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ResilientImage } from './CategoryIcon';
import { formatReadableDate } from '../utils/formatters';

interface PromoCarouselProps {
  banners: PromotionalBanner[];
  lang: LanguageCode;
  onBannerClick: (banner: PromotionalBanner) => void;
}

export function PromoCarousel({ banners, lang, onBannerClick }: PromoCarouselProps) {
  const t = TRANSLATIONS[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<PromotionalBanner | null>(null);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [banners.length, isPaused]);

  useEffect(() => {
    if (activeIndex >= banners.length && banners.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, banners.length]);

  if (banners.length === 0) return null;

  const current = banners[activeIndex] || banners[0];

  const handleOpen = (banner: PromotionalBanner) => {
    setSelectedBanner(banner);
    onBannerClick(banner);
  };

  const getTypeLabel = (banner: PromotionalBanner) => {
    if (banner.type === 'sponsored') return t.home.sponsored;
    if (banner.type === 'announcement') return t.home.announcement;
    return t.home.communityGraphic;
  };

  return (
    <>
      <section
        aria-label="Community Highlights and Promotions"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-stone-200/80"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleOpen(current)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen(current);
            }
          }}
          className="relative aspect-[16/9] md:aspect-[21/9] max-h-[340px] w-full cursor-pointer group focus:outline-none"
        >
          <ResilientImage
            src={current.imageUrl}
            alt={current.title}
            fallbackTitle={current.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15" />

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end">
            <div className="flex items-center gap-2 text-xs font-medium text-[#E5C168] mb-1.5">
              <span>{getTypeLabel(current)}</span>
              <span aria-hidden="true">·</span>
              <span>{current.city}</span>
              {current.businessName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{current.businessName}</span>
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold text-white leading-tight max-w-3xl text-balance">
              {current.title}
            </h2>
            {current.subtitle && (
              <p className="mt-1.5 text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-2xl">
                {current.subtitle}
              </p>
            )}
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
              }}
              aria-label="Previous slide"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev + 1) % banners.length);
              }}
              aria-label="Next slide"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 right-4 sm:bottom-5 sm:right-6 flex items-center gap-1.5">
              {banners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                  }}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeIndex ? 'w-6 bg-[#C59B38]' : 'w-2 bg-white/45 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {selectedBanner && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBanner(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-stone-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9]">
              <ResilientImage
                src={selectedBanner.imageUrl}
                alt={selectedBanner.title}
                fallbackTitle={selectedBanner.title}
              />
              <button
                type="button"
                onClick={() => setSelectedBanner(null)}
                aria-label={t.actions.close}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-[#B4832E]">
                <span>{getTypeLabel(selectedBanner)}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedBanner.city}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {formatReadableDate(selectedBanner.startDate, lang)} – {formatReadableDate(selectedBanner.endDate, lang)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A]">{selectedBanner.title}</h3>
              {selectedBanner.subtitle && (
                <p className="text-sm text-stone-600 leading-relaxed">{selectedBanner.subtitle}</p>
              )}
              {selectedBanner.businessName && (
                <div className="pt-3 border-t border-stone-100 text-sm text-stone-700 space-y-1">
                  <p className="font-medium text-[#0F172A]">{selectedBanner.businessName}</p>
                  {selectedBanner.businessCategory && <p className="text-xs text-stone-500">{selectedBanner.businessCategory}</p>}
                  {selectedBanner.contactDetails && <p className="text-xs text-stone-600">{selectedBanner.contactDetails}</p>}
                </div>
              )}
              <div className="pt-3 flex items-center justify-end gap-3">
                {selectedBanner.linkUrl && (
                  <a
                    href={selectedBanner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] transition-colors whitespace-nowrap"
                  >
                    <span>Visit Link</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedBanner(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  {t.actions.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
