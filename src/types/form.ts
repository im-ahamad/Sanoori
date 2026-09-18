export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  category: string;
  productInterest: string;
  quantity?: string;
  message: string;
}
