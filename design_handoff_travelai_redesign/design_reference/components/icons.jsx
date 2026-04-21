// Lucide-style line icons, stroke 1.5, size-adaptive
const Icon = ({ d, size = 18, fill = "none", stroke, style, className, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={stroke || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
       className={className} style={style}>
    {children || (d ? <path d={d} /> : null)}
  </svg>
);

const IArrowRight = (p) => <Icon {...p}><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></Icon>;
const IArrowLeft = (p) => <Icon {...p}><path d="M19 12H5"/><path d="M11 5l-7 7 7 7"/></Icon>;
const IPlane = (p) => <Icon {...p}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></Icon>;
const IMoon = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;
const ISun = (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>;
const IChat = (p) => <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>;
const IClose = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
const ISend = (p) => <Icon {...p}><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Icon>;
const IShield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const IHotel = (p) => <Icon {...p}><path d="M3 22V4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18"/><path d="M8 7h.01M8 11h.01M8 15h.01M12 7h.01M12 11h.01M12 15h.01M16 7h.01M16 11h.01M16 15h.01M3 22h18"/></Icon>;
const ICloud = (p) => <Icon {...p}><path d="M17.5 19a4.5 4.5 0 1 0 0-9 6.5 6.5 0 0 0-12.5 1.5A4 4 0 0 0 5 19h12.5z"/></Icon>;
const ICompass = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="m16 8-6 2-2 6 6-2 2-6z"/></Icon>;
const ICoin = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9h4.5a2.5 2.5 0 0 1 0 5H9"/></Icon>;
const IChevR = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const IChevL = (p) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const IPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IMinus = (p) => <Icon {...p}><path d="M5 12h14"/></Icon>;
const ICheck = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
const IExternal = (p) => <Icon {...p}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></Icon>;
const ILeaf = (p) => <Icon {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></Icon>;
const ISparkle = (p) => <Icon {...p}><path d="m12 3 1.88 5.76L20 10l-5.12 1.76L12 17l-1.88-5.24L5 10l6.12-1.24z"/></Icon>;
const ISliders = (p) => <Icon {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></Icon>;
const IUsers = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M17 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const IWallet = (p) => <Icon {...p}><path d="M20 12V8H4a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></Icon>;
const IGlobe = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></Icon>;

Object.assign(window, {
  Icon, IArrowRight, IArrowLeft, IPlane, IMoon, ISun, IChat, IClose, ISend,
  IShield, IHotel, ICloud, ICompass, ICoin, IChevR, IChevL, IPlus, IMinus,
  ICheck, IExternal, ILeaf, ISparkle, ISliders, IUsers, IWallet, IGlobe
});
