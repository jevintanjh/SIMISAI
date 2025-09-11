# Configuration Data Files

This directory contains JSON files that define the dropdown options for the SIMIS AI application.

## Files

### `device-options.json`
Contains all device-related options:
- **deviceTypes**: Available device types (thermometer, ear thermometer, etc.)
- **deviceBrands**: Available device brands (Omron, Braun, etc.)
- **deviceModels**: Available device models with their associated brands

### `preference-options.json`
Contains all user preference options:
- **languages**: Available languages with flags and labels
- **guidanceOptions**: Guidance styles (direct, gentle, detailed) with descriptions
- **voiceOptions**: Voice options (male, female, text only)

## How to Update Options

1. **Add new device types**: Edit `device-options.json` → `deviceTypes` array
2. **Add new brands**: Edit `device-options.json` → `deviceBrands` array
3. **Add new models**: Edit `device-options.json` → `deviceModels` array (include `brand` field)
4. **Add new languages**: Edit `preference-options.json` → `languages` array
5. **Modify guidance options**: Edit `preference-options.json` → `guidanceOptions` array
6. **Modify voice options**: Edit `preference-options.json` → `voiceOptions` array

## JSON Structure

Each option object should have:
- `value`: Unique identifier (string)
- `label`: Display text (string)
- `icon`: Icon emoji or identifier (string, optional)
- `enabled`: Whether option is available (boolean, optional)
- `description`: Additional description text (string, optional)
- `brand`: Associated brand for models (string, optional)
- `flag`: Country flag emoji for languages (string, optional)

## Example

```json
{
  "deviceTypes": [
    {
      "value": "thermometer",
      "label": "Type",
      "icon": "🌡️",
      "enabled": true
    }
  ]
}
```
