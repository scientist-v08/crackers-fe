import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const crackersPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{orange.50}',
            100: '{orange.100}',
            200: '{orange.200}',
            300: '{orange.300}',
            400: '{orange.400}',
            500: '{orange.500}',
            600: '{orange.600}',
            700: '{orange.700}',
            800: '{orange.800}',
            900: '{orange.900}',
            950: '{orange.950}',
        },

        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    inverseColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}',
                },
                highlight: {
                    background: '{primary.50}',
                    focusBackground: '{primary.100}',
                    color: '{primary.700}',
                    focusColor: '{primary.800}',
                },
                surface: {
                    0: '#ffffff',
                    50: '{rose.50}',
                    100: '{rose.100}',
                    200: '{rose.200}',
                    300: '{rose.300}',
                    400: '{rose.400}',
                    500: '{rose.500}',
                    600: '{rose.600}',
                    700: '{rose.700}',
                    800: '{rose.800}',
                    900: '{rose.900}',
                    950: '{rose.950}',
                },
                formField: {
                    background: '{surface.50}',
                    disabledBackground: '{surface.100}',
                    filledBackground: '{surface.50}',
                    filledHoverBackground: '{surface.100}',
                    filledFocusBackground: '{surface.0}',
                    borderColor: '{surface.200}',
                    hoverBorderColor: '{primary.700}',
                    focusBorderColor: '{primary.700}',
                    invalidBorderColor: '{red.700}',
                    color: '{surface.900}',
                    disabledColor: '{surface.500}',
                    placeholderColor: '{surface.500}',
                    invalidPlaceholderColor: '{red.600}',
                    floatLabelColor: '{surface.500}',
                    floatLabelFocusColor: '{primary.700}',
                    floatLabelActiveColor: '{surface.500}',
                    floatLabelInvalidColor: '{red.600}',
                    iconColor: '{surface.500}',
                    shadow: 'none',
                },
                text: {
                    color: '{surface.900}',
                    hoverColor: '{surface.800}',
                    mutedColor: '{surface.500}',
                    hoverMutedColor: '{surface.600}',
                },
                content: {
                    background: '{surface.0}',
                    hoverBackground: '{surface.50}',
                    borderColor: '{surface.200}',
                    color: '{surface.900}',
                    hoverColor: '{surface.800}',
                },
            },
        },
    },

    components: {
        card: {
            root: {
                background: '{content.background}',
                borderRadius: '{border.radius.lg}',
                color: '{content.color}',
                shadow: '0 1px 3px rgb(26 15 13 / 6%)',
            },
            body: {
                padding: '1rem',
                gap: '0.75rem',
            },
            title: {
                fontWeight: '500',
            },
        },

        tabs: {
            tablist: {
                background: 'transparent',
                borderColor: '{content.border.color}',
            },
            tab: {
                background: 'transparent',
                hoverBackground: 'transparent',
                activeBackground: 'transparent',
                borderColor: 'transparent',
                hoverBorderColor: 'transparent',
                activeBorderColor: '{primary.color}',
                color: '{text.muted.color}',
                hoverColor: '{text.color}',
                activeColor: '{primary.color}',
            },
            activeBar: {
                background: '{primary.color}',
                height: '2px',
            },
            tabpanel: {
                background: 'transparent',
                color: '{content.color}',
                padding: '1.5rem 0 0 0',
            },
        },

        datatable: {
            headerCell: {
                background: '{surface.50}',
                color: '{text.muted.color}',
                borderColor: '{content.border.color}',
                padding: '1rem',
            },
            bodyCell: {
                borderColor: '{content.border.color}',
            },
            row: {
                background: '{content.background}',
                hoverBackground: '{content.hover.background}',
            },
        },

        // Dialog: header only supports padding + gap (no borderColor)
        dialog: {
            root: {
                background: '{overlay.modal.background}',
                borderColor: '{content.border.color}',
                color: '{overlay.modal.color}',
                borderRadius: '{border.radius.lg}',
            },
            header: {
                padding: '1rem 1.5rem',
                gap: '0.5rem',
            },
            content: {
                padding: '1.5rem',
            },
        },

        // Toast: no "message" key — border lives on root
        toast: {
            root: {
                borderRadius: '{content.border.radius}',
                borderWidth: '1px',
            },
            colorScheme: {
                light: {
                    // Example: make success use your primary
                    success: {
                        background: 'color-mix(in srgb, {primary.50}, transparent 5%)',
                        borderColor: '{primary.200}',
                        color: '{primary.600}',
                        detailColor: '{surface.700}',
                        shadow: '0px 4px 8px 0px color-mix(in srgb, {primary.500}, transparent 96%)',
                        closeButton: {
                            hoverBackground: '{primary.100}',
                            focusRing: {
                                color: '{primary.600}',
                                shadow: 'none',
                            },
                        },
                    },

                    // Secondary / contrast usually already use surface – force them if needed
                    secondary: {
                        background: '{surface.100}',
                        borderColor: '{surface.200}',
                        color: '{surface.600}',
                        detailColor: '{surface.700}',
                        // ...
                    },
                },
            },
        },

        menubar: {
            root: {
                background: '{content.background}',
                borderColor: 'transparent',
                borderRadius: '0',
                color: '{text.muted.color}',
            },
            item: {
                focusBackground: 'transparent',
                activeBackground: 'transparent',
                color: '{text.muted.color}',
                focusColor: '{text.color}',
                activeColor: '{primary.color}',
            },
            submenu: {
                background: '{content.background}',
                borderColor: '{content.border.color}',
            },
            mobileButton: {
                color: '{primary.color}',
                hoverColor: '{text.color}',
                hoverBackground: 'transparent',
            },
        },

        // Paginator root has no borderColor
        paginator: {
            root: {
                background: 'transparent',
                color: '{text.muted.color}',
            },
        },
    },
});
