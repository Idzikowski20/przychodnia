/* eslint-disable no-unused-vars */
import { E164Number } from "libphonenumber-js/core";
import Image from "next/image";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { pl } from "date-fns/locale";
import { Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";

import { Checkbox } from "./ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

// Register Polish locale
registerLocale("pl", pl);

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

interface CustomProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  fieldType: FormFieldType;
  onValueChange?: (value: any) => void | Promise<void>;
  availableTimes?: string[];
  workingDays?: string[];
  isAdminModal?: boolean;
}

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className={`flex rounded-md shadow-sm ${
          props.isAdminModal 
            ? 'border border-gray-300 bg-gray-50 shadow-md' 
            : 'border border-gray-200 bg-white'
        }`}>
          {props.iconSrc && (
            <Image
              src={props.iconSrc}
              height={24}
              width={24}
              alt={props.iconAlt || "icon"}
              className="ml-3 my-3"
            />
          )}
          <FormControl>
            <Input
              placeholder={props.placeholder}
              {...field}
              className={`border-0 bg-transparent focus:ring-0 ${
                props.isAdminModal 
                  ? 'text-gray-900 placeholder:text-gray-500' 
                  : 'text-gray-900 placeholder:text-gray-500'
              }`}
            />
          </FormControl>
        </div>
      );
    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            className={`shadow-sm focus:ring-0 ${
              props.isAdminModal 
                ? 'border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 shadow-md' 
                : 'border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gray-300'
            }`}
            disabled={props.disabled}
          />
        </FormControl>
      );
    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="PL"
            placeholder={props.placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className="input-phone"
          />
        </FormControl>
      );
    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label htmlFor={props.name} className="checkbox-label">
              {props.label}
            </label>
          </div>
        </FormControl>
      );
    case FormFieldType.DATE_PICKER:
      return (
        <div className={`flex rounded-md shadow-sm ${
          props.isAdminModal 
            ? 'border border-gray-300 bg-gray-50 shadow-md' 
            : 'border border-gray-200 bg-white'
        }`}>
          <Image
            src="/assets/icons/calendar.svg"
            height={24}
            width={24}
            alt="user"
            className="ml-3 my-3"
          />
          <FormControl>
            <ReactDatePicker
              showTimeSelect={props.showTimeSelect ?? false}
              timeIntervals={15}
              selected={field.value}
              // Pokaż tylko dostępne czasy: jeżeli są, włącz także filterTime
              onChange={async (date: Date) => {
                field.onChange(date);
                if (props.onValueChange) {
                  await props.onValueChange(date);
                }
              }}
              timeInputLabel="Godzina:"
              dateFormat={props.dateFormat ?? "dd/MM/yyyy"}
              wrapperClassName="date-picker"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              maxDate={props.maxDate}
              minDate={props.minDate}
              placeholderText="Wybierz datę"
              isClearable
              showPopperArrow={false}
              popperClassName="react-datepicker-popper"
              calendarClassName="react-datepicker-calendar"
              withPortal={false}
              fixedHeight
              autoComplete="off"
              locale="pl"
              /* Przywrócenie poprzedniego wyglądu: bez wymuszonego min/maxTime */
              includeTimes={props.availableTimes && props.availableTimes.length > 0 ? props.availableTimes.map(time => {
                const [hours, minutes] = time.split(':');
                // Bazuj na aktualnie wybranej dacie, aby uniknąć przesunięć strefowych
                const base = field.value instanceof Date ? new Date(field.value) : new Date();
                base.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                return base;
              }) : undefined}
              filterTime={props.availableTimes && props.availableTimes.length > 0 ? (date) => {
                const h = String(date.getHours()).padStart(2, '0');
                const m = String(date.getMinutes()).padStart(2, '0');
                return props.availableTimes!.includes(`${h}:${m}`);
              } : undefined}
              filterDate={(date) => {
                if (!props.workingDays || props.workingDays.length === 0) {
                  console.log("📅 Brak workingDays - wszystkie daty dostępne");
                  return true;
                }
                
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const isAllowed = props.workingDays.includes(dayOfWeek);
                
                // Loguj tylko pierwsze 10 dat, żeby nie zaśmiecać konsoli
                if (date.getDate() <= 10) {
                  console.log(`📅 Data ${date.toDateString()} (${dayOfWeek}) - ${isAllowed ? 'DOZWOLONA' : 'BLOKOWANA'}. WorkingDays:`, props.workingDays);
                }
                
                return isAllowed;
              }}
              className={`border-0 bg-transparent focus:ring-0 w-full ${
                props.isAdminModal 
                  ? 'text-gray-900 placeholder:text-gray-500' 
                  : 'text-gray-900 placeholder:text-gray-500'
              }`}
            />
          </FormControl>
        </div>
      );
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select 
            onValueChange={async (value) => {
              field.onChange(value);
              if (props.onValueChange) {
                await props.onValueChange(value);
              }
            }} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className={`shadow-sm focus:ring-0 ${
                props.isAdminModal 
                  ? 'border border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-400 shadow-md' 
                  : 'border border-gray-200 bg-white text-gray-900 focus:border-gray-300'
              }`}>
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={`shadow-lg ${
              props.isAdminModal 
                ? 'bg-gray-50 border border-gray-300 shadow-md' 
                : 'bg-white border border-gray-200'
            }`}>
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      );
    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;
    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, name, label } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className={`font-medium ${
              props.isAdminModal ? 'text-gray-900' : 'text-gray-900'
            }`}>{label}</FormLabel>
          )}
          <RenderInput field={field} props={props} />

          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
