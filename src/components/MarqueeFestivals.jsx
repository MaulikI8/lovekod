import { useStore } from '../context/StoreContext';
import Marquee from './ui/Marquee';
import { KukurTiharIcon, GaiTiharIcon, LaxmiPujaIcon, MhaPujaIcon, BhaiTikaIcon, SparklesIcon } from './Icons';

export default function MarqueeFestivals() {
  const { festivalMoments } = useStore();

  const getIcon = (key) => {
    switch (key) {
      case 'kukur': return KukurTiharIcon;
      case 'gai': return GaiTiharIcon;
      case 'laxmi': return LaxmiPujaIcon;
      case 'mha': return MhaPujaIcon;
      case 'bhaitika': return BhaiTikaIcon;
      default: return SparklesIcon;
    }
  };

  const defaultFestivals = [
    { nepaliTitle: 'Kukur Tihar', englishSub: 'Festival of Loyalty', tag: 'Guardians of Loyalty', iconKey: 'kukur' },
    { nepaliTitle: 'Laxmi Puja', englishSub: 'Festival of Lights', tag: 'Welcoming Light & Prosperity', iconKey: 'laxmi' },
    { nepaliTitle: 'Mha Puja', englishSub: 'Soul Reverence', tag: 'Honoring the Divine Within', iconKey: 'mha' },
    { nepaliTitle: 'Bhai Tika', englishSub: 'Celebration of Siblings', tag: 'Seven-Color Tika & Makhamali', iconKey: 'bhaitika' },
    { nepaliTitle: 'Gai Tihar', englishSub: 'Sacred Reverence', tag: 'Sacred Reverence', iconKey: 'gai' },
  ];

  const sourceList = (festivalMoments && festivalMoments.length > 0) ? festivalMoments : defaultFestivals;

  return (
    <div className="festival-marquee-container" aria-label="Tihar Festival Days">
      <Marquee pauseOnHover={true} repeat={3}>
        {sourceList.map((item, idx) => {
          const IconComp = getIcon(item.iconKey);
          const title = item.nepaliTitle && !/[\u0900-\u097f]/.test(item.nepaliTitle)
            ? item.nepaliTitle
            : (item.englishSub || 'Tihar Celebration');

          return (
            <div key={idx} className="festival-pill">
              <span className="festival-pill-icon">
                <IconComp size={18} />
              </span>
              <div className="festival-pill-text">
                <span className="festival-pill-nepali">{title}</span>
                <span className="festival-pill-sub">{item.englishSub}</span>
                <span className="festival-pill-tag">• {item.tag}</span>
              </div>
            </div>
          );
        })}
      </Marquee>
    </div>
  );
}
