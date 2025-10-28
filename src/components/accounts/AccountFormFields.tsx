import React from 'react';
import { AccountType, Account } from '@/types';
import CreditCardFields from './CreditCardFields';
import LoanFields from './LoanFields';
import DematFields from '../accounts/DematFields';
import InvestmentFields from './InvestmentFields';

interface AccountFormFieldsProps {
  accountType: AccountType;
  formData: any;
  setFormData: (data: any) => void;
  allAccounts: Account[];
}

const AccountFormFields: React.FC<AccountFormFieldsProps> = ({
  accountType,
  formData,
  setFormData,
  allAccounts,
}) => {
  if (accountType === 'credit_card') {
    return <CreditCardFields formData={formData} setFormData={setFormData} />;
  }

  if (accountType.includes('_loan')) {
    return <LoanFields formData={formData} setFormData={setFormData} allAccounts={allAccounts} />;
  }

  if (['demat', 'trading'].includes(accountType)) {
    return <DematFields formData={formData} setFormData={setFormData} />;
  }

  if (['fixed_deposit', 'recurring_deposit', 'ppf', 'epf', 'nps', 'sukanya_samriddhi'].includes(accountType)) {
    return <InvestmentFields formData={formData} setFormData={setFormData} accountType={accountType} />;
  }

  return null;
};

export default React.memo(AccountFormFields);
