// 'use client';

// import { motion } from 'framer-motion';
// import { useState } from 'react';
// import { Calendar } from './calendar';

// const steps = ['User Info', 'Pickup Date', 'Address', 'Review'];

// export default function MultiStepForm() {
//   const [step, setStep] = useState(0);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     date: '',
//     address: '',
//     city: '',
//   });

//   const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
//   const prevStep = () => setStep((s) => Math.max(s - 1, 0));

//   const handleChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl space-y-6">
//       <div className="flex justify-between mb-4">
//         {steps.map((label, index) => (
//           <div key={index} className="text-sm font-semibold">
//             <span className={`rounded-full px-3 py-1 ${step === index ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
//               {label}
//             </span>
//           </div>
//         ))}
//       </div>

//       <motion.div
//         key={step}
//         initial={{ opacity: 0, x: 50 }}
//         animate={{ opacity: 1, x: 0 }}
//         exit={{ opacity: 0, x: -50 }}
//         transition={{ duration: 0.4 }}
//         className="space-y-4"
//       >
//         {step === 0 && (
//           <>
//             <input
//               type="text"
//               placeholder="Name"
//               className="w-full p-3 border rounded-xl"
//               value={formData.name}
//               onChange={(e) => handleChange('name', e.target.value)}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               className="w-full p-3 border rounded-xl"
//               value={formData.email}
//               onChange={(e) => handleChange('email', e.target.value)}
//             />
//           </>
//         )}

//         {step === 1 && (
//           <Calendar
//             selected={formData.date ? { from: new Date(formData.date) } : undefined}
//             onSelect={(range) => handleChange('date', range?.from ? range.from.toISOString().split('T')[0] : '')}
//           />
//         )}

//         {step === 2 && (
//           <>
//             <input
//               type="text"
//               placeholder="Address"
//               className="w-full p-3 border rounded-xl"
//               value={formData.address}
//               onChange={(e) => handleChange('address', e.target.value)}
//             />
//             <input
//               type="text"
//               placeholder="City"
//               className="w-full p-3 border rounded-xl"
//               value={formData.city}
//               onChange={(e) => handleChange('city', e.target.value)}
//             />
//           </>
//         )}

//         {step === 3 && (
//           <div className="space-y-2 text-gray-700">
//             <p><strong>Name:</strong> {formData.name}</p>
//             <p><strong>Email:</strong> {formData.email}</p>
//             <p><strong>Pickup Date:</strong> {formData.date}</p>
//             <p><strong>Address:</strong> {formData.address}, {formData.city}</p>
//           </div>
//         )}
//       </motion.div>

//       <div className="flex justify-between mt-4">
//         {step > 0 && (
//           <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded-xl">
//             Back
//           </button>
//         )}
//         {step < steps.length - 1 ? (
//           <button onClick={nextStep} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-xl">
//             Next
//           </button>
//         ) : (
//           <button
//             onClick={() => alert('Form submitted!')}
//             className="ml-auto px-4 py-2 bg-green-600 text-white rounded-xl"
//           >
//             Submit
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
