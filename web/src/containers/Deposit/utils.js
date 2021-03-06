import React from 'react';
import QRCode from 'qrcode.react';
import classnames from 'classnames';
import { BASE_CURRENCY, DEFAULT_COIN_DATA } from '../../config/constants';
import STRINGS from '../../config/localizedStrings';

import { isMobile } from 'react-device-detect';
import { renderDumbField } from '../Wallet/components'; // eslint-disable-line

export const generateBaseInformation = (id = '') => (
   <div className="text">
      {STRINGS.DEPOSIT.INFORMATION_MESSAGES.map((message, index) => (
         <p key={index}>{message}</p>
      ))}
      {id && (
         <p>
            {STRINGS.formatString(STRINGS.DEPOSIT_BANK_REFERENCE, id).join(' ')}
         </p>
      )}
   </div>
);

const renderBTCContent = (label = '', address = '', onCopy, copyOnClick, destinationAddress = '', destinationLabel = '') =>
   address ? (
      <div
         className={classnames(
            'deposit_info-wrapper d-flex align-items-center',
            isMobile && 'flex-column-reverse'
         )}
      >
         <div>
            <div className="deposit_info-crypto-wrapper">
               {renderDumbField({
                  label,
                  value: address,
                  fullWidth: true,
                  allowCopy: true,
                  onCopy,
                  copyOnClick
               })}
            </div>
            {destinationAddress
               ? <div className="deposit_info-crypto-wrapper">
                  {renderDumbField({
                     label: destinationLabel,
                     value: destinationAddress,
                     fullWidth: true,
                     allowCopy: true,
                     onCopy,
                     copyOnClick
                  })}
               </div>
               : null
            }
         </div>
         <div className="deposit_info-qr-wrapper d-flex align-items-center justify-content-center">
            <div className="qr_code-wrapper d-flex flex-column">
               <div className="qr-code-bg d-flex justify-content-center align-items-center">
                  <QRCode value={address} />
               </div>
               <div className="qr-text">{STRINGS.DEPOSIT.QR_CODE}</div>
            </div>
         </div>
      </div>
   ) : (
         <div>{STRINGS.DEPOSIT.NO_DATA}</div>
      );

export const renderContent = (symbol, crypto_wallet = {}, coins = {}, onCopy) => {
   if (coins[symbol] && symbol !== BASE_CURRENCY) {
      const { fullname } = coins[symbol] || DEFAULT_COIN_DATA;
      let address = crypto_wallet[symbol];
      let destinationAddress = '';
      if (symbol === 'xrp') {
         const temp = address.split(':');
         address = temp[0] ? temp[0] : address;
         destinationAddress = temp[1] ? temp[1] : ''
      }
      return renderBTCContent(
         STRINGS.formatString(
            STRINGS.DEPOSIT.CRYPTO_LABELS.ADDRESS,
            fullname
         ),
         address,
         onCopy,
         true,
         destinationAddress,
         STRINGS.formatString(
            STRINGS.DEPOSIT.CRYPTO_LABELS.DESTINATION_TAG,
            fullname
         )
      );
   } else {
      return <div>{STRINGS.DEPOSIT.NO_DATA}</div>;
   }
};
