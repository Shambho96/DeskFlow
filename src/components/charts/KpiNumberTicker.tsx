import React from 'react';
import NumberFlow, { type Format } from '@number-flow/react';
import { motion } from 'motion/react';

export interface KpiNumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: Format;
  className?: string;
  layout?: boolean;
}

export const KpiNumberTicker: React.FC<KpiNumberTickerProps> = ({
  value,
  prefix,
  suffix,
  format,
  className = '',
  layout = true,
}) => {
  return (
    <motion.span
      layout={layout}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`inline-flex items-baseline font-bold tabular-nums tracking-tight ${className}`}
    >
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <NumberFlow
        value={value}
        format={format}
        transformTiming={{ duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      />
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </motion.span>
  );
};
