import { DiscountDropdownInterface } from '../interfaces/discountDropdown.interface';
import { DropdownInterface } from '../interfaces/dropdown.interface';

export const discountDropDownOptions: DiscountDropdownInterface[] = [
  { id: 1, value: '70%', discount: 0.3 },
  { id: 2, value: '75%', discount: 0.25 },
  { id: 3, value: '77%', discount: 0.23 },
  { id: 4, value: '78%', discount: 0.22 },
  { id: 5, value: '80%', discount: 0.2 },
];

export const companyDropdown: DropdownInterface[] = [
  { id: 1, value: 'st', item: 'Standard' },
  { id: 2, value: 'ot', item: 'Other/Gift Box' },
];

export const categoryDropdown: DropdownInterface[] = [
  { id: 1, value: 'sp', item: 'Sparklers' },
  { id: 2, value: 'fp', item: 'Flower pots' },
  { id: 3, value: 'bc', item: 'Chakra' },
  { id: 4, value: 'dm', item: 'Dum Dum' },
  { id: 5, value: 'fc', item: 'Rockets/Sky-shots' },
  { id: 6, value: 'ss', item: 'Sky shots' },
  { id: 7, value: 'gf', item: 'Gift box' },
];
