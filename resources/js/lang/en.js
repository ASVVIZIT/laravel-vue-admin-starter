export default {
  "route": {
    "Dashboard": "Dashboard",
    "Permission": "Permissions",
    "PagePermission": "Page Permissions",
    "RolePermission": "Role Permissions",
    "DirectivePermission": "Directives",
    "Charts": "Charts",
    "KeyboardChart": "Keyboard Chart",
    "LineChart": "Line Chart",
    "MixChart": "Mix Chart",
    "Table": "Table",
    "Form": "Form",
    "ErrorPages": "Error Pages",
    "Page401": "401",
    "Page404": "404",
    "Administrator": "Administrator",
    "UserList": "Users",
    "UserProfile": "User Profile",
    "DynamicTable": "Dynamic table",
    "Guide": "Website Guide",
    "Entity": "References and Components",
    "Brands": "Brands",
    "DeviceType": "Device Types",
    "MeasurementUnit": "Measurement Units",
    "Accessories": "Electrical Accessories",
    "AccessoriesList": "Accessories List",
    "AccessoryCreate": "Create Electrical Accessory",
    "AccessoryEdit": "Edit Electrical Accessory",
    "i18nChecker": "i18n Translations Checker",
    "Diagnostics": "Diagnostics"
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
  "auth": {
    "forgotPasswordTitle": "Forgot password?",
    "forgotPasswordSubtitle": "Enter your email and we'll send you a reset link",
    "sendResetLink": "Send reset link",
    "emailSent": "Email sent!",
    "checkEmail": "Check your email",
    "resetLinkSent": "If the account exists, you will receive an email",
    "resetLinkSentGeneric": "If the account exists in our database, the owner will receive an email with password reset instructions.",
    "resetLinkSentHint": "If you don't receive the email within a few minutes — check your Spam folder or make sure the email is correct.",
    "resetFailed": "Failed to send reset link",
    "backToLogin": "Back to login",

    "resetPasswordTitle": "Reset password",
    "resetPasswordSubtitle": "Enter a new password",
    "resetPassword": "Reset password",
    "passwordResetSuccess": "Password successfully reset",
    "invalidResetLink": "Invalid or expired link",

    "registerTitle": "Create account",
    "registerSubtitle": "Fill out the form to create an account",
    "register": "Register",
    "registerSuccess": "Registration successful! Check your email",
    "registerFailed": "Registration failed",
    "alreadyHaveAccount": "Already have an account? Sign in",
    "agreeTerms": "I agree to the terms of use",
    "mustAgreeTerms": "Please accept the terms",

    "emailVerificationTitle": "Email Verification",
    "emailVerificationSubtitle": "We sent a verification link to your email",
    "emailVerified": "Your email is verified!",
    "checkYourEmail": "Check your email:",
    "goToLogin": "Go to login",
    "verificationResent": "Verification email resent",
    "resendFailed": "Failed to send email",
    "resendVerification": "Resend verification email",
    "resendCooldown": "Retry in {seconds}s",
    "sending": "Sending...",
    "verifying": "Verifying...",
    "invalidVerificationLink": "Invalid verification link",
    "verificationFailed": "Verification failed",

    // 🔥 STANDALONE AUTH PAGES (email confirmation, restore, verify, reset)
    "contactSupport": "Questions?",

    "confirmEmail": {
      "processingTitle": "Confirming...",
      "processingMessage": "Please wait, verifying the link...",
      "successTitle": "Email confirmed!",
      "successMessage": "Your email is confirmed. You can now log in.",
      "errorTitle": "Confirmation error",
      "errorMessage": "The link is invalid or has expired."
    },

    "restoreAccount": {
      "processingTitle": "Restoring...",
      "processingMessage": "Restoring your account...",
      "successTitle": "Account restored!",
      "successMessage": "Your account has been restored. You can now log in.",
      "errorTitle": "Restore error",
      "errorMessage": "The link is invalid or the account was not found."
    },

    "emailVerify": {
      "processingTitle": "Verifying email...",
      "processingMessage": "Verifying your address...",
      "successTitle": "Email verified!",
      "successMessage": "Your email is verified. You can now log in.",
      "errorTitle": "Verification error",
      "errorMessage": "The link is invalid or has expired."
    },

    "passwordResetByToken": {
      "title": "Reset Password",
      "formMessage": "Enter a new password for your account",
      "processingTitle": "Resetting...",
      "processingMessage": "Saving new password...",
      "successTitle": "Password reset!",
      "successMessage": "Your password has been changed. Log in with the new password.",
      "errorTitle": "Reset error",
      "errorMessage": "The link is invalid or has expired.",
      "newPassword": "New password",
      "newPasswordPlaceholder": "At least 6 characters",
      "confirmPassword": "Confirm password",
      "confirmPasswordPlaceholder": "Repeat the password",
      "submit": "Reset password"
    }
  },
  "login": {
    "title": "Log in to your personal account",
    "adminTitle": "Administrator Login",
    "testerTitle": "Test Login",
    "moderatorTitle": "Moderator Login",
    "vipTitle": "VIP Login",

    "email": "Email",
    "username": "Username",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "any": "any",

    "logIn": "Log In",
    "loginAsTester": "Log in as Tester",
    "selectRole": "Select Role",

    "forgotPassword": "Forgot Password?",
    "register": "Register",
    "rememberMe": "Remember me",
    "twoFactorCode": "2FA Code",
    "captcha": "Enter captcha",
    "vipCode": "VIP Code",

    "thirdparty": "Or connect with",
    "thirdpartyTips": "Cannot be simulated locally, so please integrate your own business simulation!!!",

    "loginSuccess": "Login successful",
    "loginFailed": "Login failed"
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
      "role": { "required": "Role is required" },
      "name": { "required": "Name is required" },
      "sex": { "required": "Gender is required" },
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
        "required": "Confirm password is required",
        "mismatched": "Passwords do not match!"
      },
      "twoFactor": {
        "required": "2FA code is required",
        "pattern": "Code must be 6 digits",
        "placeholder": "Enter 6-digit code"
      },
      "captcha": {
        "required": "Captcha is required",
        "invalid": "Invalid captcha"
      },
      "phone": {
        "required": "Phone is required",
        "pattern": "Invalid phone format"
      },
      "vipCode": {
        "required": "VIP code is required",
        "pattern": "VIP code must be in format VIP-XXXXXXXX"
      },
      "accessory": {
        "fields": {
          "name": { "required": "Name is required" },
          "model": { "required": "Model is required" },
          "type_id": { "required": "Select device type" },
          "brand_id": { "required": "Select brand" }
        }
      }
    }
  },
  "permission": {
    "search": "Search permissions...",
    "actions": {
      "addRole": "Add Role Permission",
      "editPermission": "Edit Permissions",
      "delete": "Delete",
      "confirm": "Confirm",
      "cancel": "Cancel"
    },
    "messages": {
      "unsavedChanges": "You have unsaved changes. Close without saving?",
      "noPermissionsSelected": "No permissions selected. Continue?",
      "editPermissionForForm": "Edit permissions for",
      "switchRoles": "Switch roles",
      "tips": "In some cases, using v-role/v-permission is not suitable (e.g., Element Tab component or el-table-column). Use v-if with checkRole/checkPermission instead."
    },
    "errors": {
      "noUserData": "User data not found",
      "cantEditAdmin": "Cannot edit permissions for administrator users"
    },
    "table": {
      "edit": { "user": "Edit Access Rights" },
      "rolePermissions": { "name": "Inherited from role" },
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
        "confirm1": { "message": "This will permanently delete the user" }
      },
      "elMessage": {
        "update": {
          "success": { "message": "Permissions updated successfully" },
          "error": { "message": "An error occurred while updating permissions." }
        },
        "delete": {
          "success": { "message": "Deletion completed" },
          "canceled": { "message": "Deletion canceled" }
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
          "success": { "message": "Permissions updated successfully" }
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
      "buttons": { "actions": "Action list" },
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
          "role": { "title": "Role", "placeholder": "Select a role" },
          "name": { "title": "Name", "placeholder": "Your name" },
          "email": { "title": "Email", "placeholder": "Your email" },
          "password": { "title": "Password", "placeholder": "Enter password" },
          "confirmPassword": { "title": "Confirm Password", "placeholder": "Must not match name or email" },
          "sex": { "title": "Gender", "placeholder": "" },
          "male": { "title": "Male", "placeholder": "" },
          "female": { "title": "Female", "placeholder": "" },
          "age": { "title": "Age", "placeholder": "Birthdate not specified" },
          "birthday": { "title": "Birthday", "placeholder": "Select birthdate" },
          "description": { "title": "Description", "placeholder": "Write about yourself..." }
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
        "confirm1": { "message@j": "This will permanently delete the user.<br><strong>{name}</strong>" }
      },
      "elMessage": {
        "created": {
          "success": { "message": "User created" },
          "error": { "message": "User creation error" }
        },
        "delete": {
          "success": { "message": "User successfully deleted" },
          "error": { "message": "User deletion error" },
          "canceled": { "message": "Deletion canceled" }
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
      "emailStatus": "Email Status",
      "tabs": {
        "timeline": "Timeline",
        "account": "Account"
      },
      "elMessage": {
        "update": {
          "success": { "message": "User information has been successfully updated" }
        },
        "reverify": {
          "success": "Re-verification email sent to your inbox",
          "error": "Error sending email"
        }
      },
      "fields": {
        "role": { "title": "Role", "placeholder": "Please select a role" },
        "name": { "title": "Name", "placeholder": "Your name" },
        "email": {
          "title": "Email",
          "placeholder": "Your email",
          "changeHint": "Changing email requires verification via your current email address",
          "systemEmail": "System email - verification not required"
        },
        "email_verified": { "title": "Email Status" },
        "email_reverified": { "title": "Last Re-verification" },
        "password": { "title": "Password", "placeholder": "Enter password" },
        "confirmPassword": { "title": "Confirm Password", "placeholder": "Must not match name or email" },
        "sex": { "title": "Gender", "placeholder": "" },
        "male": { "title": "Male", "placeholder": "" },
        "female": { "title": "Female", "placeholder": "" },
        "age": { "title": "Age", "placeholder": "Birth date not specified" },
        "birthday": { "title": "Birthday", "placeholder": "Select birth date" },
        "description": { "title": "Description", "placeholder": "Write about yourself..." }
      },
      "actions": {
        "request_reverify": "Request Re-verification"
      },
      "emailChange": {
        "title": "Change Email",
        "currentEmail": "Current Email",
        "newEmail": "New Email",
        "changeButton": "Change",
        "requestButton": "Request Change",
        "successMessage": "Confirmation email sent to your current address",
        "errorMessage": "Error requesting email change",
        "cancelButton": "Cancel",
        "infoText": "A confirmation link will be sent to your current email",
        "sameAsCurrent": "New email must not be the same as current"
      }
    }
  },
  "roles": {
    "admin": "Administrator",
    "user": "User",
    "moderator": "Moderator",
    "name": "Role",
    "description": {
      "superadmin": "Super Administrator. Has access and full permission to all pages, and more.",
      "admin": "Administrator. Has access and full permission to all pages.",
      "manager": "Manager. Has access and permissions to most pages, except the permissions page.",
      "editor": "Editor. Has access to most pages, full permission to access articles and related resources.",
      "user": "Normal user. Has access to some pages.",
      "visitor": "Visitor. Has access to static pages, no write permissions.",
      "moderator": "Moderator. Can moderate content and manage users.",
      "vip": "VIP. Privileged user with extended capabilities."
    }
  },
  "switchLang": {
    "localName": "Language switched successfully"
  },
  "form": {
    "button": {
      "save": "Save",
      "cancel": "Cancel",
      "confirm": "Confirm"
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
        "group": { "safety": "Safety and Operating Conditions" }
      },
      "additional": {
        "title": "Additional Equipment",
        "group": { "compatibility": "Compatibility and Control" }
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
      "true": "yes",
      "false": "no"
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
        "name": { "label": "Brand Name", "placeholder": "e.g. Schneider Electric" },
        "country": { "label": "Manufacturer Country", "placeholder": "e.g. France" },
        "website": { "label": "Website", "placeholder": "https://example.com" },
        "description": { "label": "Description", "placeholder": "Brief brand description" }
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
        "name": { "label": "Type Name", "placeholder": "e.g. Circuit Breaker" },
        "code": { "label": "Type Code", "placeholder": "e.g. CB" },
        "description": { "label": "Description", "placeholder": "Brief device type description" }
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
        "name": { "label": "Name", "placeholder": "e.g. Ampere" },
        "symbol": { "label": "Symbol (stored)", "placeholder": "e.g. a (lowercase)" },
        "display_symbol": { "label": "Display Symbol", "placeholder": "e.g. A" },
        "physical_quantity": { "label": "Physical Quantity", "placeholder": "e.g. current" },
        "measurement_category_id": { "label": "Category", "placeholder": "Select category" }
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
    "noData": "No data",
    "items": "items",
    "selected": "selected",
    "warning": "Warning",
    "submitting": "Saving...",
    "required": "Required field",
    "verified": "Verified",
    "unverified": "Unverified",
    "never": "Never",
    "yes": "Yes",
    "no": "No",
    "view404": {
      "buttons": {
        "back": "Back",
        "backHome": "Back Home"
      },
      "OOPS": "OOPS!",
      "Message": "The bodyguard said that you can't enter this page...",
      "Info": "Please check that the URL you entered is correct. Click the button below to return to the homepage.",
      "CopyrightBy": "Copyright by",
      "ProjectInGithub": "Project in github"
    },
    "view401": {
      "buttons": {
        "back": "Back",
        "backHome": "Back Home"
      },
      "CanGo": "Or you can go:",
      "OOPS": "Whoops!",
      "Permission": "You do not have permission to access this page.",
      "MessageAdmin": "If you are not satisfied, please contact the administrator.",
      "JustLookingAroundHref": "https://www.google.com/",
      "JustLookingAround": "Internet search",
      "ShowPicture": "Show a splash screen",
      "CasualLook": "Access is denied"
    },
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
  },
  "error": {
    "loadPermissions": "Error loading permissions"
  },
  "roles_description_admin": "System administrator",
  "roles_description_superadmin": "Super administrator",

  "users": {
    "listTitle": "User List",
    "viewTitle": "View User",
    "deletedAt": "Deleted",
    "status": {
      "label": "Status",
      "all": "All",
      "active": "🟢 Active",
      "banned": "🔴 Banned",
      "trashed": "⚫ Deleted",
      "unverified": "🟡 Unverified"
    },
    "actions": {
      "ban": "Ban",
      "unban": "Unban",
      "restore": "Restore",
      "edit": "Edit",
      "delete": "Delete",
      "view": "View",
      "permissions": "Permissions",
      "cannotEditAdmin": "Cannot edit",
      "adminEditHint": "Profile available, permissions protected",
      "adminConfirmOld": "Confirm old email",
      "adminConfirmNew": "Confirm new email",
      "adminQuickActions": "Admin actions",
      "adminQuickActionsHint": "Confirm email change bypassing email sending",
      "confirmReason": "Confirmation reason",
      "confirmReasonPlaceholder": "Example: User lost access to old email, identity verified by passport",
      "resendNewEmail": "Request new email verification"
    },
    "dialogs": {
      "banConfirm": "Are you sure you want to ban user {name}?",
      "banTitle": "Ban Confirmation",
      "restoreConfirm": "Restore user {name}?",
      "restoreTitle": "Restore Confirmation"
    },
    "messages": {
      "banSuccess": "User banned",
      "banError": "Ban error",
      "unbanSuccess": "User unbanned",
      "unbanError": "Unban error",
      "restoreSuccess": "User restored",
      "restoreError": "Restore error",
      "adminConfirmSuccess": "Action completed successfully",
      "adminConfirmError": "Error performing action",
      "resendNewEmailSuccess": "Confirmation email sent to new email",
      "resendNewEmailError": "Failed to send confirmation email"
    },
    "permissions": {
      "tooltip": {
        "role_view": "Inherited from role — View",
        "role_manage": "Inherited from role — Manage",
        "user_view": "Additional — View",
        "user_manage": "Additional — Manage"
      }
    },
    "verify": {
      "label": "Verifications",
      "oldReal": "Step 1: old email confirmed via letter",
      "oldSystem": "Step 1: old email confirmed by admin (system)",
      "newReal": "Step 2: new email confirmed via letter",
      "newSystem": "Step 2: new email confirmed by admin (system)",
      "notDone": "Step not completed",
      "step1Requested": "Step 1: email change requested, awaiting confirmation",
      "step1Done": "Step 1: email change request completed",
      "step1NotRequested": "Step 1: email change not requested",
      "step2NotDone": "Step 2: old email not confirmed",
      "step3NotDone": "Step 3: new email not confirmed"
    }
  },

  "i18nChecker": {
    "title": "i18n Translations Checker",
    "subtitle": "Check and scan translations",
    "simpleMode": "Simple Check",
    "simpleDesc": "Check known list of keys",
    "scannerMode": "Code Scanner",
    "scannerDesc": "Automatic search of all keys",
    "validatorMode": "Path Validation",
    "startScan": "Start Scanner",
    "scanning": "Scanning...",
    "scanComplete": "Scan complete!",
    "scanFailed": "Scan failed",
    "scanError": "Scan error",
    "scanHint": "Scanner will find all keys in code and compare with translations",
    "keysInCode": "keys in code",
    "validating": "Validating...",
    "startValidation": "Validate Paths",
    "validateHint": "Finds keys with incorrect nesting",
    "validationComplete": "Path validation complete!",
    "totalKeys": "Total",
    "coverage": "Coverage",
    "usedInCode": "Used",
    "missingKeys": "Missing",
    "unusedKeys": "Unused",
    "duplicates": "Duplicates",
    "wrongPaths": "Wrong paths",
    "flatKeys": "Flat keys",
    "searchKey": "Search by key...",
    "allFiles": "All files",
    "allCategories": "All categories",
    "all": "All",
    "statusFound": "✅ Found",
    "statusMissing": "❌ Missing",
    "search": "Search...",
    "refresh": "Refresh",
    "exportMissing": "Export",
    "colKey": "Key",
    "colCategory": "Category",
    "colPriority": "Priority",
    "colTranslation": "Translation",
    "colStatus": "Status",
    "key": "Key",
    "priority": "Priority",
    "translation": "Translation",
    "files": "Files",
    "paths": "Paths",
    "wrongPath": "Wrong path",
    "correctPath": "Correct path",
    "usedIn": "Used in",
    "priorityCritical": "CRIT",
    "priorityNormal": "NORM",
    "priorityLow": "LOW",
    "ok": "OK",
    "miss": "MISS",
    "notTranslated": "Not translated",
    "missingIn": "Missing in",
    "unusedIn": "Unused in",
    "duplicatesFound": "Duplicates found",
    "wrongPathsFound": "Wrong paths found",
    "flatKeysFound": "Flat keys found",
    "copy": "Copy",
    "copyFilteredKeys": "Filtered keys",
    "copyAllKeys": "All keys",
    "copyFilteredTemplate": "Translation template (filtered)",
    "copyAllTemplate": "Translation template (all)",
    "copiedCount": "Copied",
    "copyFailed": "Failed to copy",
    "total": "Total",
    "found": "Found",
    "missing": "Missing",
    "showing": "Showing",
    "from": "of",
    "entries": "entries",
    "noMissing": "All keys present!",
    "exported": "Exported!",
    "copied": "Keys copied!",
    "noIssues": "No translation issues!",
    "noPathIssues": "No path issues!",
    "clickToScan": "Click \"Start Scanner\" to analyze translations",
    "clickToValidate": "Click \"Validate Paths\" to analyze structure",
    "language": "Language",
    "category": "Category",
    "status": "Status",
    "foundKeys": "Found keys",
    "byCategory": "By category",
    "detailedResults": "Detailed results",
    "settings": {
      "title": "I18nChecker Module Settings",
      "open": "Settings",
      "cancel": "Cancel",
      "reset": "Reset",
      "save": "Save",
      "success": "Success",
      "error": "Error",
      "saved": "Settings saved",
      "resetDone": "Settings reset",
      "saveFailed": "Failed to save settings",
      "meta": {
        "toggle": "Configure form display",
        "layout": "Tabs layout",
        "layoutHorizontal": "↔ Horizontal",
        "layoutVertical": "↕ Vertical",
        "visibleTabs": "Visible tabs",
        "tabIcons": "🎨 Icons",
        "tabDisplay": "📊 Display",
        "tabBehavior": "⚙️ Behavior"
      },
      "icons": {
        "title": "Icons",
        "sourceTitle": "Icon source",
        "iconType": "Icon type",
        "iconTypeTip": "Source from which module icons will be loaded",
        "bootstrapOption": "🅱️ Bootstrap Icons",
        "fenixOption": "🦊 Fenix SVG",
        "customOption": "🎨 Custom",
        "sizeColorTitle": "Size and color",
        "iconSize": "Icon size (px)",
        "iconColor": "Icon color",
        "iconColorTip": "Current value:",
        "displayTitle": "Display",
        "showLabels": "Show labels in preview",
        "useGradients": "Use gradients",
        "useGradientsTip": "Apply gradients to SVG icons (Fenix/Custom)",
        "previewTitle": "Icons preview",
        "previewCount": "icons"
      },
      "display": {
        "title": "Display",
        "tablesTitle": "Tables",
        "tableHeight": "Table height (px)",
        "fontSize": "Font size (px)",
        "limitsTitle": "Display limits",
        "maxFilesPerRow": "Max. files per row",
        "maxFilesPerRowTip": "How many files to show in one table row",
        "maxUnusedKeys": "Max. unused keys",
        "maxUnusedKeysTip": "How many unused keys to display in the list",
        "maxFlatKeys": "Max. flat keys",
        "maxFlatKeysTip": "How many flat keys to display in the list",
        "appearanceTitle": "Appearance",
        "compactMode": "Compact mode",
        "compactModeTip": "Reduces margins and padding for denser display"
      },
      "behavior": {
        "title": "Behavior",
        "autoRunTitle": "Auto-run",
        "autoRunScanner": "Auto-run scanner",
        "autoRunScannerTip": "Automatically start scanner when switching to mode",
        "autoRunValidator": "Auto-run validator",
        "autoRunValidatorTip": "Automatically start validator when switching to mode",
        "cacheTitle": "Caching",
        "cacheResults": "Cache results",
        "cacheTTL": "Cache lifetime (sec)",
        "cacheTTLTip": "After how many seconds the cache will be considered stale",
        "cacheUsed": "From cache",
        "cacheFresh": "Fresh data",
        "cacheExpired": "Cache expired",
        "uiTitle": "Interface",
        "confirmExport": "Confirm before export",
        "highlightSearch": "Highlight search results",
        "highlightSearchTip": "Highlight found text in tables",
        "highlightColor": "Highlight color",
        "highlightColorTip": "Color automatically picks contrasting text",
        "highlightPreview": "Preview",
        "confirm": "Confirm"
      }
    }
  },

  "i18nView": {
    "title": "International Example",
    "note": "See documentation for adding and removing languages",
    "datePlaceholder": "Select date",
    "selectPlaceholder": "Select",
    "default": "Default",
    "primary": "Primary",
    "success": "Success",
    "info": "Info",
    "warning": "Warning",
    "danger": "Danger",
    "tableName": "Name",
    "tableDate": "Date",
    "tableAddress": "Address",
    "one": "一",
    "two": "二",
    "three": "三"
  },

  "console": {
    "userResource": {
      "fetchPermissions": "Fetching permissions for user ID:",
      "fetchPermissionsSuccess": "Permissions fetched successfully:",
      "fetchPermissionsError": "Error fetching permissions for user ID:",
      "updatePermissions": "Updating permissions for user ID:",
      "updatePermissionsSuccess": "Permissions updated successfully:",
      "updatePermissionsError": "Error updating permissions for user ID:",
      "banAttempt": "Attempting to ban user ID:",
      "banSuccess": "User ID banned successfully:",
      "banError": "Error banning user ID:",
      "unbanAttempt": "Attempting to unban user ID:",
      "unbanSuccess": "User ID unbanned successfully:",
      "unbanError": "Error unbanning user ID:",
      "restoreAttempt": "Attempting to restore user ID:",
      "restoreSuccess": "User ID restored successfully:",
      "restoreError": "Error restoring user ID:",
      "reverifyRequest": "Requesting email re-verification",
      "reverifySuccess": "Re-verification email requested successfully:",
      "reverifyError": "Error requesting re-verification:"
    },
    "diagnostics": {
      "fetchConfig": "Fetching diagnostics configuration",
      "fetchConfigSuccess": "Diagnostics configuration fetched:",
      "fetchConfigError": "Error fetching diagnostics configuration:",
      "fetchChecks": "Fetching checks for entity:",
      "fetchChecksSuccess": "Checks fetched:",
      "fetchChecksError": "Error fetching checks:"
    }
  },

  "diagnostics": {
    "title": "System Diagnostics",
    "entities": {
      "users": "Users"
    },
    "coming_soon": "Diagnostics module for this entity is under development",
    "check_id": "Check",
    "status": "Status",
    "details": "Result",
    "action": "Action",
    "copy_cli": "Copy CLI",
    "status_ok": "OK",
    "status_warn": "Warning",
    "status_fail": "Error",
    "email_inspector": {
      "tab": "Email Inspector",
      "title": "Email Address Check",
      "placeholder": "Enter email to check",
      "check": "Check",
      "email": "Email",
      "valid_format": "Valid format",
      "mx_records": "MX records",
      "domain": "Domain",
      "registered": "Registered",
      "user_id": "User ID",
      "is_system": "System",
      "system_role": "System role",
      "verified": "Verified",
      "banned": "Banned",
      "trashed": "Trashed",
      "status_type": "Status type"
    },
    "system_users": {
      "tab": "System Users",
      "title": "Test Accounts",
      "count": "Total: {count}",
      "reset": "Reset and Recreate",
      "name": "Name",
      "email": "Email",
      "role": "Role",
      "verified": "Verified",
      "banned": "Banned",
      "trashed": "Trashed"
    },
    "help": {
      "main_title": "System Diagnostics",
      "main_desc": "Real-time system integrity and configuration checks. Read-only — no data changes.",

      "users_title": "Users Checklist",
      "users_desc": "User model, users table, routes and permissions check. OK — good, WARN — nuance, FAIL — issue. CLI button — run command to fix.",

      "inspector_title": "Email Inspector",
      "inspector_desc": "Email check: format, MX records, system registration, statuses (verified/banned/trashed). Read-only.",

      "system_users_title": "System Users",
      "system_users_desc": "Test accounts (password: TestPassword123!). «Reset» button — deletes and recreates."
    }
  }
};
