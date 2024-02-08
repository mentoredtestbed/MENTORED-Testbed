// import * as React from 'react';

// interface DropdownButtonProps {
//   options: string[];
//   selectedOption: string;
//   onOptionSelected: (option: string) => void;
// }

// export function DropdownButton(props: DropdownButtonProps) {
//   const { options, selectedOption, onOptionSelected } = props;

//   const [isOpen, setIsOpen] = React.useState(false);

//   const toggleDropdown = () => {
//     setIsOpen(!isOpen);
//   };

//   const selectOption = (option: string) => {
//     onOptionSelected(option);
//     setIsOpen(false);
//   };

//   return (
//     <div className="dropdown-button">
//       <button onClick={toggleDropdown}>
//         {selectedOption}
//       </button>
//       {isOpen && (
//         <ul>
//           {options.map(option => (
//             <li key={option} onClick={() => selectOption(option)}>
//               {option}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }