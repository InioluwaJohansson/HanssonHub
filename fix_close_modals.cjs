const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The typical structure is: toast.success('...');
// After success, we want to close the modal.
const regexes = [
  { match: /toast\.success\('Appliance added successfully'\);/g, replace: "toast.success('Appliance added successfully'); setIsAddDeviceOpen(false);" },
  { match: /toast\.success\('Door added successfully'\);/g, replace: "toast.success('Door added successfully'); setIsAddDeviceOpen(false);" },
  { match: /toast\.success\('Light added successfully'\);/g, replace: "toast.success('Light added successfully'); setIsAddDeviceOpen(false);" },
  { match: /toast\.success\('Window added successfully'\);/g, replace: "toast.success('Window added successfully'); setIsAddDeviceOpen(false);" },
  { match: /toast\.success\('Camera added successfully'\);/g, replace: "toast.success('Camera added successfully'); setIsAddDeviceOpen(false);" },
  { match: /toast\.success\('Contact added successfully'\);/g, replace: "toast.success('Contact added successfully'); setIsAddContactOpen(false);" },
  { match: /toast\.success\('Person created successfully'\);/g, replace: "toast.success('Person created successfully'); setIsAddPersonOpen(false);" },
  { match: /toast\.success\('User created safely'\);/g, replace: "toast.success('User created safely'); setIsAddPersonOpen(false);" },
  { match: /toast\.success\('Room added successfully'\);/g, replace: "toast.success('Room added successfully'); setIsAddRoomOpen(false);" },
  { match: /toast\.success\('Section added successfully'\);/g, replace: "toast.success('Section added successfully'); setIsAddSectionOpen(false);" },
  { match: /toast\.success\('External device added successfully'\);/g, replace: "toast.success('External device added successfully'); setIsAddExternalOpen(false);" },
  { match: /toast\.success\('Action updated successfully'\);/g, replace: "toast.success('Action updated successfully'); setIsEditActionOpen(false);" },
  { match: /toast\.success\('Action created successfully'\);/g, replace: "toast.success('Action created successfully'); setIsAddActionOpen(false);" },
  { match: /toast\.success\('Schedule created successfully'\);/g, replace: "toast.success('Schedule created successfully'); setIsAddScheduleOpen(false);" },
  { match: /toast\.success\('Schedule updated successfully'\);/g, replace: "toast.success('Schedule updated successfully'); setIsEditScheduleOpen(false);" },
  { match: /toast\.success\('Device added successfully'\);/g, replace: "toast.success('Device added successfully'); setIsAddDeviceOpen(false);" },
  // updates
  { match: /toast\.success\('Appliance updated successfully'\);/g, replace: "toast.success('Appliance updated successfully'); setIsEditDeviceOpen(false);" },
  { match: /toast\.success\('Door updated successfully'\);/g, replace: "toast.success('Door updated successfully'); setIsEditDeviceOpen(false);" },
  { match: /toast\.success\('Window updated successfully'\);/g, replace: "toast.success('Window updated successfully'); setIsEditDeviceOpen(false);" },
  { match: /toast\.success\('Camera updated successfully'\);/g, replace: "toast.success('Camera updated successfully'); setIsEditDeviceOpen(false);" },
  { match: /toast\.success\('Light updated successfully'\);/g, replace: "toast.success('Light updated successfully'); setIsEditDeviceOpen(false);" },
  { match: /toast\.success\('Device updated successfully'\);/g, replace: "toast.success('Device updated successfully'); setIsEditDeviceOpen(false);" },
  { match: /toast\.success\('Room updated successfully'\);/g, replace: "toast.success('Room updated successfully'); setIsEditRoomOpen(false);" },
  { match: /toast\.success\('External device updated successfully'\);/g, replace: "toast.success('External device updated successfully'); setIsEditExternalOpen(false);" },
  { match: /toast\.success\('Settings updated successfully\\. Restart app to apply if needed\\.'\);/g, replace: "toast.success('Settings updated successfully. Restart app to apply if needed.'); setIsSettingsOpen(false);" }
];

regexes.forEach(r => {
  code = code.replace(r.match, r.replace);
});

fs.writeFileSync('src/App.tsx', code);
