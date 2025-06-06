export default {
  "route": {
    "dashboard": "Dashboard",
    "permission": "Permissions",
    "pagePermission": "Page Permissions",
    "rolePermission": "Role Permissions",
    "directivePermission": "Directives",
    "charts": "Charts",
    "keyboardChart": "Keyboard Chart",
    "lineChart": "Line Chart",
    "mixChart": "Mix Chart",
    "table": "Table",
    "form": "Form",
    "errorPages": "Error Pages",
    "page401": "401",
    "page404": "404",
    "administrator": "Administrator",
    "UserList": "Users",
    "userProfile": "User Profile",
    "guide": "Website Guide",
    "entity": "References and Components",
    "brands": "Brands",
    "DeviceType": "Device Types",
    "MeasurementUnit": "Measurement Units",
    "Accessories": "Electrical Accessories",
    "AccessoriesList": "Accessories List",
    "AccessoryCreate": "Create Electrical Accessory",
    "AccessoryEdit": "Edit Electrical Accessory"
  },
  "navbar": {
    "logOut": "Log Out",
    "dashboard": "Dashboard",
    "github": "Github",
    "theme": "Theme",
    "size": "Global Size",
    "profile": "Profile",
    "logout": "Log Out",
    "home": "Home"
  },
  "login": {
    "title": "Log in to Your Account",
    "logIn": "Log In",
    "username": "Username",
    "password": "Password",
    "any": "any",
    "thirdparty": "Or connect with",
    "thirdpartyTips": "Cannot be simulated locally. Please implement your own business logic!",
    "email": "Email",
    "loginSuccess": "Login Successful"
  },
  "validation": {
    "general": {
      "notNameAdmin": "This name is not allowed",
      "required": "Required field",
      "minLength": "Minimum {min} characters",
      "email": "Invalid email",
      "phone": "Invalid phone format",
      "match": "Must match {field}",
      "specialChars": "At least {min} special characters required",
      "notMatch": "Password must not match {field}",
      "passwordNotEmail": "Password must not match email",
      "passwordNotName": "Password must not match name",
      "matchPassword": "Passwords must match"
    },
    "fields": {
      "password": "password",
      "phone": "phone",
      "email": "email",
      "name": "name"
    },
    "rules": {
      "role": {
        "required": "Role is required"
      },
      "name": {
        "required": "Name is required"
      },
      "sex": {
        "required": "Gender is required"
      },
      "email": {
        "required": "Email is required",
        "type": "Enter a valid email"
      },
      "password": {
        "placeholder": "Enter the password",
        "required": "Password is required",
        "minLength": "Password cannot be less than 6 digits"
      },
      "confirmPassword": {
        "required": "Confirm password",
        "mismatched": "Passwords do not match!"
      },
      "accessory": {
        "fields": {
          "name": {
            "required": "Name is required"
          },
          "model": {
            "required": "Model is required"
          },
          "type_id": {
            "required": "Select device type"
          },
          "brand_id": {
            "required": "Select brand"
          }
        }
      }
    }
  },
  "permission": {
    "actions": {
      "addRole": "Add Role Permission",
      "editPermission": "Edit Permissions",
      "delete": "Delete",
      "confirm": "Confirm",
      "cancel": "Cancel"
    },
    "messages": {
      "editPermissionForForm": "Edit permissions for",
      "switchRoles": "Switch roles",
      "tips": "In some cases, using v-role/v-permission is not suitable (e.g., Element Tab component or el-table-column). Use v-if with checkRole/checkPermission instead."
    },
    "table": {
      "edit": {
        "user": "Edit Access Rights"
      },
      "rolePermissions": {
        "name": "Inherited from role"
      },
      "userPermissions": {
        "name": {
          "menu": "Additional Menus",
          "permissions": "Additional Permissions"
        }
      },
      "elMessageBox": {
        "confirmButtonText": "Confirm",
        "cancelButtonText": "Cancel",
        "warning": "Warning",
        "continue": "Continue?",
        "confirm1": {
          "message": "This will permanently delete the user"
        }
      },
      "elMessage": {
        "update": {
          "success": {
            "message": "Permissions updated successfully"
          }
        },
        "delete": {
          "success": {
            "message": "Deletion completed"
          },
          "canceled": {
            "message": "Deletion canceled"
          }
        },
        "newUser": {
          "success": {
            "message": {
              "part1": "New user",
              "part2": "has been created successfully."
            }
          }
        },
        "confirmPermission": {
          "success": {
            "message": "Permissions updated successfully"
          }
        }
      }
    }
  },
  "table": {
    "general": {
      "description": "Description",
      "dynamicTips1": "Fixed header, sorted by header order",
      "dynamicTips2": "Unfixed header, sorted by click order",
      "dragTips1": "Default order",
      "dragTips2": "Order after dragging",
      "title": "Title",
      "importance": "Importance",
      "type": "Type",
      "remark": "Remark",
      "search": "Search",
      "add": "Add",
      "filterReset": "Reset all filters",
      "export": "Export",
      "reviewer": "Reviewer",
      "id": "ID",
      "date": "Date",
      "author": "Author",
      "readings": "Readings",
      "status": "Status",
      "actions": "Actions",
      "edit": "Edit",
      "publish": "Publish",
      "draft": "Draft",
      "delete": "Delete",
      "cancel": "Cancel",
      "confirm": "Confirm"
    },
    "user": {
      "form": {
        "title": {
          "create": "Create New User",
          "edit": "Edit User"
        },
        "about_me": "About Me",
        "education": "Education",
        "skills": "Skills",
        "tabs": {
          "timeline": "Timeline",
          "account": "Account"
        },
        "fields": {
          "role": {
            "title": "Role",
            "placeholder": "Select a role"
          },
          "name": {
            "title": "Name",
            "placeholder": "Your name"
          },
          "email": {
            "title": "Email",
            "placeholder": "Your email"
          },
          "password": {
            "title": "Password",
            "placeholder": "Enter password"
          },
          "confirmPassword": {
            "title": "Confirm Password",
            "placeholder": "Must not match name or email"
          },
          "sex": {
            "title": "Gender",
            "placeholder": ""
          },
          "male": {
            "title": "Male",
            "placeholder": ""
          },
          "female": {
            "title": "Female",
            "placeholder": ""
          },
          "age": {
            "title": "Age",
            "placeholder": "Birthdate not specified"
          },
          "birthday": {
            "title": "Birthday",
            "placeholder": "Select birthdate"
          },
          "description": {
            "title": "Description",
            "placeholder": "Write about yourself..."
          }
        }
      },
      "columns": {
        "id": "ID",
        "name": "Name",
        "email": "Email",
        "role": "Role"
      },
      "elMessageBox": {
        "deleteTitle": "Deleting a user!",
        "confirmButtonText": "Accept",
        "cancelButtonText": "Cancel",
        "warning": "Warning",
        "continue": "Continue?",
        "confirm1": {
          "message@j": "This will permanently delete the user.<br><strong>{name}</strong>"
        }
      },
      "elMessage": {
        "created": {
          "success": {
            "message": "User created"
          },
          "error": {
            "message": "User creation error"
          }
        },
        "delete": {
          "success": {
            "message": "User successfully deleted"
          },
          "error": {
            "message": "User deletion error"
          },
          "canceled": {
            "message": "Deletion canceled"
          }
        },
        "newUser": {
          "success": {
            "message": {
              "part1": "New user",
              "part2": "has been successfully created."
            }
          }
        }
      }
    }
  },
  "tagsView": {
    "refresh": "Refresh",
    "close": "Close",
    "closeOthers": "Close Others",
    "closeAll": "Close All"
  },
  "settings": {
    "title": "Page Style Settings",
    "theme": "Theme Color",
    "tagsView": "Enable Tags-View",
    "fixedHeader": "Fixed Header",
    "sidebarLogo": "Sidebar Logo"
  },
  "user": {
    "profile": {
      "notfound": "User not found",
      "avatar": "Avatar",
      "about_me": "About Me",
      "education": "Education",
      "skills": "Skills",
      "tabs": {
        "timeline": "Timeline",
        "account": "Account"
      },
      "elMessage": {
        "update": {
          "success": {
            "message": "User information has been updated successfully"
          }
        }
      },
      "fields": {
        "role": {
          "title": "Role",
          "placeholder": "Select a role"
        },
        "name": {
          "title": "Name",
          "placeholder": "Your name"
        },
        "email": {
          "title": "Email",
          "placeholder": "Your email"
        },
        "password": {
          "title": "Password",
          "placeholder": "Enter password"
        },
        "confirmPassword": {
          "title": "Confirm Password",
          "placeholder": "Must not match name or email"
        },
        "sex": {
          "title": "Gender",
          "placeholder": ""
        },
        "male": {
          "title": "Male",
          "placeholder": ""
        },
        "female": {
          "title": "Female",
          "placeholder": ""
        },
        "age": {
          "title": "Age",
          "placeholder": "Birthdate not specified"
        },
        "birthday": {
          "title": "Birthday",
          "placeholder": "Select birthdate"
        },
        "description": {
          "title": "Description",
          "placeholder": "Write about yourself..."
        }
      }
    }
  },
  "roles": {
    "name": "Role",
    "description": {
      "superadmin": "Super Administrator: Full access to all pages and features.",
      "admin": "Administrator: Full access to all pages.",
      "manager": "Manager: Access to most pages except permissions.",
      "editor": "Editor: Access to articles and related resources.",
      "user": "User: Limited access to specific pages.",
      "visitor": "Visitor: Access to static pages only."
    }
  },
  "switchLang": {
    "localName": "Language switched successfully"
  },
  "form": {
    "button": {
      "save": "Save",
      "cancel": "Cancel"
    }
  },
  "accessory": {
    "form_title_edit": "Edit Accessory",
    "form_title_create": "Create Accessory",
    "tabs": {
      "main": {
        "title": "Main Information",
        "group": {
          "critical": "Critical Fields",
          "basicTech": "Basic Technical Data"
        }
      },
      "technical": {
        "title": "Technical Specifications",
        "group": {
          "electrical": "Electrical Parameters",
          "construction": "Design Features"
        }
      },
      "operational": {
        "title": "Operational Parameters",
        "group": {
          "safety": "Safety and Operating Conditions"
        }
      },
      "additional": {
        "title": "Additional Equipment",
        "group": {
          "compatibility": "Compatibility and Control"
        }
      }
    },
    "table": {
      "title": "Accessories List",
      "add_button": "Add Accessory",
      "search_placeholder": "Search by model, name or brand...",
      "empty_text": "No data",
      "total_items": "Total records:",
      "actions": "Actions",
      "columns": {
        "id": "ID",
        "name": "Name",
        "model": "Model",
        "brand": "Brand",
        "type": "Type",
        "compatible_models": "Compatible Models",
        "cross_section": "Cable Section",
        "current_rating": "Rated Current",
        "thickness": "Thickness",
        "quantity_per_pack": "Qty per Pack",
        "rated_diff_current": "Diff. Current",
        "voltage": "Voltage",
        "communication_protocol": "Comm Protocol",
        "remote_control": "Remote",
        "ip_rating": "IP Rating",
        "mounting_type": "Mounting Type",
        "standards": "Standards",
        "material": "Material",
        "edit": "Edit",
        "delete": "Delete"
      }
    },
    "messages": {
      "delete_confirm": "Are you sure you want to delete the accessory? This action cannot be undone.",
      "delete_confirm_title": "Delete Confirmation",
      "delete_success": "Accessory deleted successfully",
      "delete_error": "Error deleting accessory: {error}"
    },
    "placeholders": {
      "name": "Example: Remote Control Module",
      "model": "Example: ARA iC60",
      "description": "Example: Detailed accessory description",
      "series": "Example: Acti9",
      "voltage": "Example: 230/400",
      "ip_rating": "Example: IP40",
      "mounting_type": "Example: Modular",
      "standards": "Example: IEC 60947",
      "material": "Example: Thermoplastic",
      "compatible_models": "Example: iC60, NG125",
      "communication_protocol": "Example: Ti24"
    },
    "fields": {
      "model": "Model",
      "name": "Name",
      "description": "Description",
      "brand_id": "Brand",
      "type_id": "Device Type",
      "series": "Series",
      "cross_section": "Cable Cross-Section",
      "cross_section_unit_id": "Cross-Section Unit",
      "current_rating": "Rated Current",
      "current_rating_unit_id": "Current Unit",
      "thickness": "Thickness",
      "thickness_unit_id": "Thickness Unit",
      "compatible_models": "Compatible Models",
      "communication_protocol": "Communication Protocol",
      "remote_control": "Remote Control Support",
      "voltage": "Voltage",
      "voltage_unit_id": "Voltage Unit",
      "ip_rating": "IP Rating",
      "mounting_type": "Mounting Type",
      "standards": "Standards",
      "material": "Material",
      "nominal_current": "Nominal Current",
      "trip_curve": "Trip Curve",
      "breaking_capacity": "Breaking Capacity",
      "breaking_capacity_unit_id": "Breaking Capacity Unit",
      "tripping_time": "Tripping Time",
      "tripping_time_unit_id": "Tripping Time Unit",
      "temperature_range_min": "Min Temperature Range",
      "temperature_range_max": "Max Temperature Range",
      "temperature_range_min_unit_id": "Min Temperature Unit",
      "temperature_range_max_unit_id": "Max Temperature Unit",
      "quantity_per_pack": "Quantity per Pack",
      "quantity_per_pack_unit_id": "Quantity Unit",
      "rated_diff_current": "Rated Differential Current",
      "rated_diff_current_unit_id": "Diff Current Unit"
    },
    "remote_control_status": {
      "yes": "yes",
      "no": "no"
    },
    "buttons": {
      "table": "To Table",
      "save": "Save Accessory",
      "create": "Create Accessory",
      "back": "Back",
      "cancel": "Cancel"
    }
  },
  "brand": {
    "table": {
      "title": "Brands List",
      "add_button": "Add Brand",
      "search_placeholder": "Search by name, country or website...",
      "empty_text": "No data",
      "total_items": "Total records:",
      "actions": "Actions",
      "per_page_selector": "Items per page:",
      "columns": {
        "id": "ID",
        "name": "Name",
        "country": "Country",
        "website": "Website"
      },
      "item_actions": {
        "edit": "Edit",
        "delete": "Delete"
      }
    },
    "form": {
      "add_title": "Add Brand",
      "edit_title": "Editing: {name}",
      "fields": {
        "name": {
          "label": "Brand Name",
          "placeholder": "e.g. Schneider Electric"
        },
        "country": {
          "label": "Manufacturer Country",
          "placeholder": "e.g. France"
        },
        "website": {
          "label": "Website",
          "placeholder": "https://example.com"
        },
        "description": {
          "label": "Description",
          "placeholder": "Brief brand description"
        }
      },
      "rules": {
        "name_required": "Name is required",
        "website_required": "Website is required",
        "website_url": "Enter valid URL"
      },
      "buttons": {
        "cancel": "Cancel",
        "add": "Add",
        "save": "Save"
      }
    },
    "messages": {
      "delete_confirm": "Are you sure you want to delete the brand? This action cannot be undone.",
      "delete_confirm_title": "Delete Confirmation",
      "delete_success": "Brand deleted successfully",
      "add_success": "Brand added successfully",
      "update_success": "Changes saved",
      "error": "Error: {error}"
    }
  },
  "deviceType": {
    "table": {
      "title": "Device Types List",
      "add_button": "Add Type",
      "search_placeholder": "Search by name, code or description...",
      "empty_text": "No data",
      "total_items": "Total records:",
      "per_page_selector": "Items per page:",
      "actions": "Actions",
      "columns": {
        "id": "ID",
        "name": "Name",
        "code": "Code",
        "description": "Description"
      },
      "item_actions": {
        "edit": "Edit",
        "delete": "Delete"
      }
    },
    "form": {
      "add_title": "Add Device Type",
      "edit_title": "Editing: {name}",
      "fields": {
        "name": {
          "label": "Type Name",
          "placeholder": "e.g. Circuit Breaker"
        },
        "code": {
          "label": "Type Code",
          "placeholder": "e.g. CB"
        },
        "description": {
          "label": "Description",
          "placeholder": "Brief device type description"
        }
      },
      "rules": {
        "name_required": "Name is required",
        "code_required": "Code is required"
      },
      "buttons": {
        "cancel": "Cancel",
        "add": "Add",
        "save": "Save"
      }
    },
    "messages": {
      "delete_confirm": "Are you sure you want to delete the device type? This action cannot be undone.",
      "delete_confirm_title": "Delete Confirmation",
      "delete_success": "Device type deleted successfully",
      "add_success": "Device type added successfully",
      "update_success": "Changes saved",
      "error": "Error: {error}"
    }
  },
  "measurementUnit": {
    "table": {
      "title": "Measurement Units List",
      "add_button": "Add Unit",
      "search_placeholder": "Search by name, symbol, quantity or category...",
      "empty_text": "No data",
      "total_items": "Total records:",
      "per_page_selector": "Items per page:",
      "actions": "Actions",
      "columns": {
        "id": "ID",
        "name": "Name",
        "display_symbol": "Symbol",
        "physical_quantity": "Physical Quantity",
        "category": "Category"
      },
      "item_actions": {
        "edit": "Edit",
        "delete": "Delete"
      }
    },
    "form": {
      "add_title": "Add Measurement Unit",
      "edit_title": "Editing: {name}",
      "fields": {
        "name": {
          "label": "Name",
          "placeholder": "e.g. Ampere"
        },
        "symbol": {
          "label": "Symbol (stored)",
          "placeholder": "e.g. a (lowercase)"
        },
        "display_symbol": {
          "label": "Display Symbol",
          "placeholder": "e.g. A"
        },
        "physical_quantity": {
          "label": "Physical Quantity",
          "placeholder": "e.g. current"
        },
        "measurement_category_id": {
          "label": "Category",
          "placeholder": "Select category"
        }
      },
      "rules": {
        "name_required": "Name is required",
        "symbol_required": "Symbol is required",
        "display_symbol_required": "Display symbol is required",
        "physical_quantity_required": "Physical quantity is required",
        "category_required": "Category is required"
      },
      "buttons": {
        "cancel": "Cancel",
        "add": "Add",
        "save": "Save"
      }
    },
    "messages": {
      "delete_confirm": "Are you sure you want to delete the measurement unit? This action cannot be undone.",
      "delete_confirm_title": "Delete Confirmation",
      "delete_success": "Measurement unit deleted successfully",
      "add_success": "Measurement unit added successfully",
      "update_success": "Changes saved",
      "error": "Error: {error}"
    }
  },
  "common": {
    "submitting": "Saving...",
    "required": "Required field",
    "units": {
      "A": "A",
      "V": "V",
      "mm": "mm",
      "mm²": "mm²",
      "°C": "°C",
      "mA": "mA",
      "kA": "kA",
      "ms": "ms",
      "шт": "pcs",
      "m": "m",
      "N": "N",
      "Pa": "Pa",
      "W": "W",
      "Hz": "Hz",
      "kg": "kg",
      "l": "l"
    }
  }
};
