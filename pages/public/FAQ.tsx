import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQ = () => {
  const { t, config } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is ArmotCms?",
      answer: "ArmotCms is an ultra-modern, plugin-based Content Management System designed for speed, flexibility, and SEO optimization right out of the box."
    },
    {
      question: "How do I install plugins?",
      answer: "You can easily install plugins via the Admin Dashboard > Plugin Manager. You can upload custom plugins or install from the core repository."
    },
    {
      question: "Is it SEO friendly?",
      answer: "Yes! ArmotCms comes with built-in schema markup, meta tag management, and sitemap generation to ensure your content ranks well."
    },
    {
      question: "Can I create my own themes?",
      answer: "Absolutely. The theming system is fully modular. You can create a new folder in the themes directory with your template files and activate it from the dashboard."
    },
    {
      question: "Which database does it use?",
      answer: "ArmotCms is optimized for MySQL but uses an abstraction layer that allows it to support other SQL databases if configured."
    }
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Inject JSON-LD for SEO
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
           <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-4">
          {t('frequently_asked_questions')}
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Everything you need to know about {config.siteName}.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`border rounded-xl transition-colors duration-200 overflow-hidden ${
              openIndex === index 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center p-5 text-right rtl:text-right ltr:text-left focus:outline-none"
            >
              <span className={`font-bold text-lg ${openIndex === index ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                {faq.question}
              </span>
              <span className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}>
                 {openIndex === index ? (
                   <ChevronUp className="text-primary-500" />
                 ) : (
                   <ChevronDown className="text-gray-400" />
                 )}
              </span>
            </button>
            <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
               <div className="p-5 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-transparent">
                  {faq.answer}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};