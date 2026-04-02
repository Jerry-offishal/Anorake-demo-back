export type TenantType = {
  name: string;
  description?: string;
  category: string;
  tags?: string[]; // filter keyword (ex: romantic, cosy, ...)
  logo?: string;

  location: {
    address: string;
    city: string;
    country: string;
  };

  open_hours: Record<string, { open: string; close: string }>; // open and close hours

  services: {
    wifi?: boolean;
    parking?: boolean;
    accessibility?: boolean;
    vegan_options?: boolean;
    halal_options?: boolean;
    payment_methods?: string[];
  };

  contact: {
    phone: string;
    email: string;
    website?: string;
    whatsapp?: string;
  };

  status?: 'open' | 'closed' | 'full';
};
