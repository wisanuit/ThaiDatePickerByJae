import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField,
  Popover,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Divider,
  TextFieldProps,
} from '@mui/material';
import { CalendarMonth, ChevronLeft, ChevronRight, Close, AccessTime, Check } from '@mui/icons-material';

import {
  formatThaiDate,
  parseThaiDate,
  formatThaiDateTime,
  parseThaiDateTime,
  formatADDate,
  parseADDate,
  formatADDateTime,
  parseADDateTime,
  BE_OFFSET,
  THAI_MONTHS,
  getDaysInMonth,
  getFirstDayOfMonth,
} from './dateUtils';

// Extend MUI TextFieldProps so we can pass things like size="small", fullWidth, etc.
// Value is now string (AD format YYYY-MM-DD)
interface ThaiDatePickerProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string; // AD string: "2026-02-18"
  onChange: (value: string) => void;
  withTime?: boolean;
}

const ThaiDatePicker: React.FC<ThaiDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  withTime = false,
  InputProps,
  ...textFieldProps // Spread other TextField props (size, fullWidth, variant, etc.)
}) => {
  const [inputValue, setInputValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // ViewDate tracks the month/year currently shown in the calendar popover
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  // Internal state for time selection in the popover
  const [selectedTime, setSelectedTime] = useState({ hour: 0, minute: 0 });

  const defaultPlaceholder = withTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
  const effectivePlaceholder = placeholder || defaultPlaceholder;
  const isCalendarOpen = Boolean(anchorEl);

  // Helpers to format based on mode
  const formatThai = (d: Date | null) => (withTime ? formatThaiDateTime(d) : formatThaiDate(d));
  const parseThai = (s: string) => (withTime ? parseThaiDateTime(s) : parseThaiDate(s));
  const formatAD = (d: Date | null) => (withTime ? formatADDateTime(d) : formatADDate(d));
  const parseAD = (s: string) => (withTime ? parseADDateTime(s) : parseADDate(s));

  // Robust synchronization of external value prop (AD String) to internal string state (Thai String)
  useEffect(() => {
    // 1. Parse current BE input value to Date (to check if user is currently typing something valid)
    const currentInputDate = parseThai(inputValue);

    // 2. Parse external AD value prop to Date
    const propDate = parseAD(value);

    const isSameDate = (d1: Date | null, d2: Date | null) => {
      if (!d1 && !d2) return true;
      if (!d1 || !d2) return false;
      return d1.getTime() === d2.getTime();
    };

    // 3. If prop date differs from what's currently in the input (parsed), update input.
    if (!isSameDate(propDate, currentInputDate)) {
      if (propDate) {
        setInputValue(formatThai(propDate));
        setViewDate(propDate);
        setSelectedTime({ hour: propDate.getHours(), minute: propDate.getMinutes() });
      } else {
        // Only clear input if the external value is empty AND the current input isn't a partial/valid date
        // This allows clearing from parent, but prevents fighting with user while they type valid chars
        if (!value) {
          setInputValue('');
        }
      }
    }
  }, [value, withTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setViewMode('day');
    if (disabled) return;
    setAnchorEl(event.currentTarget.parentElement); // Anchor to the input container
    const propDate = parseAD(value);
    if (propDate) {
      setViewDate(propDate);
      setSelectedTime({ hour: propDate.getHours(), minute: propDate.getMinutes() });
    } else {
      const now = new Date();
      setViewDate(now);
      setSelectedTime({ hour: now.getHours(), minute: now.getMinutes() });
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    // On blur/close, revert input to match the valid AD value (if it exists)
    // This fixes partial inputs (e.g. user typed "01/01/" and clicked away)
    const propDate = parseAD(value);
    if (propDate) {
      setInputValue(formatThai(propDate));
    } else if (!value) {
      setInputValue('');
    }
  };

  // Handle Input Change (User types BE date)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, ''); // Strip non-digits

    // Masking logic
    const maxDigits = withTime ? 12 : 8;
    if (raw.length > maxDigits) raw = raw.slice(0, maxDigits);

    let formatted = '';
    if (raw.length > 0) formatted += raw.slice(0, 2);
    if (raw.length >= 3) formatted += '/' + raw.slice(2, 4);
    if (raw.length >= 5) formatted += '/' + raw.slice(4, 8);

    if (withTime) {
      if (raw.length >= 9) formatted += ' ' + raw.slice(8, 10);
      if (raw.length >= 11) formatted += ':' + raw.slice(10, 12);
    }

    setInputValue(formatted);

    const expectedLength = withTime ? 16 : 10;

    if (formatted.length === expectedLength) {
      // User typed full BE date. Parse it.
      const parsedDate = parseThai(formatted);
      if (parsedDate) {
        // Convert Date -> AD String -> Parent
        const adString = formatAD(parsedDate);
        onChange(adString);

        setViewDate(parsedDate);
        setSelectedTime({ hour: parsedDate.getHours(), minute: parsedDate.getMinutes() });
      } else {
        onChange(''); // Invalid date
      }
    } else if (raw.length === 0) {
      onChange(''); // Cleared
    }
  };

  // Calendar Navigation
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePrev = () => {
    if (viewMode === 'day') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else if (viewMode === 'month') {
      setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (viewMode === 'month') {
      setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
    }
  };

  const handleDateSelect = (day: number) => {
    const hour = withTime ? selectedTime.hour : 0;
    const minute = withTime ? selectedTime.minute : 0;
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, hour, minute);

    // Update value to AD String
    const adString = formatAD(newDate);
    onChange(adString);

    // Update display to BE String
    setInputValue(formatThai(newDate));

    if (!withTime) {
      handleClose();
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
    const newTime = { ...selectedTime, [type]: val };
    setSelectedTime(newTime);

    const propDate = parseAD(value);
    if (propDate) {
      const newDate = new Date(propDate);
      newDate.setHours(newTime.hour);
      newDate.setMinutes(newTime.minute);

      const adString = formatAD(newDate);
      onChange(adString);
      setInputValue(formatThai(newDate));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setInputValue('');
    setSelectedTime({ hour: 0, minute: 0 });
  };

  const handleToday = () => {
    const now = new Date();
    const adString = formatAD(now);
    onChange(adString);
    setInputValue(formatThai(now));

    setViewDate(now);
    setSelectedTime({ hour: now.getHours(), minute: now.getMinutes() });
    if (!withTime) handleClose();
  };

  // Calendar Grid Generation
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [viewDate]);

  const currentYearBE = viewDate.getFullYear() + BE_OFFSET;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Check if current view matches the selected value
  const propDate = parseAD(value);

  return (
    <Box sx={{ width: textFieldProps.fullWidth ? '100%' : 'auto' }}>
      <TextField
        {...textFieldProps}
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        InputProps={{
          ...InputProps,
          endAdornment: (
            <InputAdornment position="end">
              {/* {value && !disabled && (
                <IconButton size="small" onClick={handleClear} edge="end" sx={{ mr: 0.5 }}>
                  <Close fontSize="small" />
                </IconButton>
              )} */}
              <IconButton
                size="small"
                onClick={handleOpen}
                edge="start"
                disabled={disabled}
                color={isCalendarOpen ? 'primary' : 'default'}
                sx={{ p: 0.5 }}
              >
                <CalendarMonth />
              </IconButton>
              {InputProps?.endAdornment}
            </InputAdornment>
          ),
        }}
        inputProps={{
          ...textFieldProps.inputProps,
          maxLength: withTime ? 16 : 10,
          style: { ...textFieldProps.inputProps?.style },
        }}
        InputLabelProps={{
          ...textFieldProps.InputLabelProps,
          style: { ...textFieldProps.InputLabelProps?.style },
        }}
      />

      <Popover
        open={isCalendarOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            p: 2,
            width: 320,
            borderRadius: 2,
          },
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <IconButton onClick={handlePrev} size="small">
            <ChevronLeft />
          </IconButton>
          <Box textAlign="center">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ cursor: 'pointer' }}
              onClick={() => setViewMode('month')}
            >
              {THAI_MONTHS[viewDate.getMonth()]}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer' }}
              onClick={() => setViewMode('year')}
            >
              พ.ศ. {currentYearBE}
            </Typography>
          </Box>
          <IconButton onClick={handleNext} size="small">
            <ChevronRight />
          </IconButton>
        </Box>
        {viewMode === 'year' && (
          <Grid container spacing={1} columns={4}>
            {Array.from({ length: 12 }, (_, i) => {
              const startYear = currentYearBE - 6;
              const year = startYear + i;
              return (
                <Grid xs={1} key={year}>
                  <Button
                    fullWidth
                    onClick={() => {
                      setViewDate(new Date(year - BE_OFFSET, viewDate.getMonth(), 1));
                      setViewMode('month');
                    }}
                  >
                    {year}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        )}

        {viewMode === 'month' && (
          <Grid container spacing={1} columns={3}>
            {THAI_MONTHS.map((m, i) => (
              <Grid xs={1} key={i}>
                <Button
                  fullWidth
                  onClick={() => {
                    setViewDate(new Date(viewDate.getFullYear(), i, 1));
                    setViewMode('day');
                  }}
                >
                  {m}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
        {viewMode === 'day' && (
          <>
            {/* Week Days */}
            <Grid container spacing={0.5} mb={1} columns={7}>
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
                <Grid xs={1} key={i} textAlign={'center'}>
                  <Typography align="center" variant="caption" color="text.secondary" fontWeight="bold">
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={0.5} columns={7}>
              {calendarGrid.map((day, index) => {
                if (day === null) {
                  return <Grid xs={1} key={`empty-${index}`} sx={{ height: 36 }} />;
                }

                const isSelected =
                  propDate &&
                  propDate.getDate() === day &&
                  propDate.getMonth() === viewDate.getMonth() &&
                  propDate.getFullYear() === viewDate.getFullYear();

                const today = new Date();
                const isToday =
                  today.getDate() === day &&
                  today.getMonth() === viewDate.getMonth() &&
                  today.getFullYear() === viewDate.getFullYear();

                return (
                  <Grid xs={1} key={`day-${day}`}>
                    <Button
                      disableElevation
                      fullWidth
                      variant={isSelected ? 'contained' : isToday ? 'outlined' : 'text'}
                      color={isSelected ? 'primary' : 'inherit'}
                      sx={{
                        minWidth: 0,
                        p: 0,
                        height: 36,
                        borderRadius: 2,
                        fontWeight: isSelected || isToday ? 'bold' : 'normal',
                        borderColor: isToday && !isSelected ? 'primary.main' : undefined,
                        color: isToday && !isSelected ? 'primary.main' : undefined,
                      }}
                      onClick={() => handleDateSelect(day)}
                    >
                      {day}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

        {/* Time Selection */}
        {withTime && (
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">เวลา (Time)</Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={selectedTime.hour}
                  onChange={(e) => handleTimeChange('hour', Number(e.target.value))}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                >
                  {hours.map((h) => (
                    <MenuItem key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography>:</Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={selectedTime.minute}
                  onChange={(e) => handleTimeChange('minute', Number(e.target.value))}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                >
                  {minutes.map((m) => (
                    <MenuItem key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {/* Footer */}
        <Box mt={2} pt={1} borderTop="1px solid #eee" display="flex" justifyContent="space-between" alignItems="center">
          <Button size="small" onClick={handleToday}>
            วันนี้ (Today)
          </Button>

          {withTime ? (
            <Button size="small" variant="contained" onClick={handleClose} startIcon={<Check />}>
              ตกลง
            </Button>
          ) : (
            <Typography variant="caption" color="text.secondary">
              ค.ศ. {viewDate.getFullYear()}
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default ThaiDatePicker;
