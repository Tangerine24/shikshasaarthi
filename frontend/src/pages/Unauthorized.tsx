import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="p-12 text-center max-w-md mx-auto my-12 bg-surface rounded-card border border-border">
      <h1 className="text-4xl font-bold mb-2 text-danger">403</h1>
      <h2 className="text-lg font-semibold text-text-primary mb-2">{t('errors.unauthorized')}</h2>
      <p className="text-sm text-text-secondary mb-6">{t('errors.unauthorized_desc')}</p>
      <Link
        to="/"
        className="inline-block bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
      >
        {t('errors.go_home')}
      </Link>
    </div>
  );
};

export default Unauthorized;
