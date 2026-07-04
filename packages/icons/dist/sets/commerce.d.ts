declare const commerceIcons: {
    readonly bank: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly card: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h3\"></path>";
    };
    readonly cart: {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path>";
    };
    readonly cash: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M18 9v6\"></path>";
    };
    readonly 'credit-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path>";
    };
    readonly receipt: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path>";
    };
    readonly 'badge-dollar': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly 'badge-percent': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8 16 8-8\"></path><circle cx=\"9\" cy=\"9\" r=\"1\"></circle><circle cx=\"15\" cy=\"15\" r=\"1\"></circle>";
    };
    readonly barcode: {
        readonly body: "<path d=\"M4 5v14\"></path><path d=\"M7 5v14\"></path><path d=\"M11 5v14\"></path><path d=\"M13 5v14\"></path><path d=\"M17 5v14\"></path><path d=\"M20 5v14\"></path>";
    };
    readonly gift: {
        readonly body: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M3 12h18\"></path><path d=\"M12 8v13\"></path><path d=\"M12 8H8.5A2.5 2.5 0 1 1 11 5.5L12 8z\"></path><path d=\"M12 8h3.5A2.5 2.5 0 1 0 13 5.5L12 8z\"></path>";
    };
    readonly invoice: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path>";
    };
    readonly landmark: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'shopping-bag': {
        readonly body: "<path d=\"M6 8h12l1 13H5L6 8z\"></path><path d=\"M9 8a3 3 0 0 1 6 0\"></path>";
    };
    readonly store: {
        readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><path d=\"M4 10a2 2 0 0 0 4 0\"></path><path d=\"M8 10a2 2 0 0 0 4 0\"></path><path d=\"M12 10a2 2 0 0 0 4 0\"></path><path d=\"M16 10a2 2 0 0 0 4 0\"></path>";
    };
    readonly ticket: {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M13 6v12\"></path>";
    };
    readonly truck: {
        readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle>";
    };
    readonly vault: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path><path d=\"M18 9h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly wallet: {
        readonly body: "<path d=\"M4 7h14a3 3 0 0 1 3 3v8H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12\"></path><path d=\"M16 13h5\"></path><path d=\"M17 13h.01\"></path>";
    };
    readonly coins: {
        readonly body: "<ellipse cx=\"8\" cy=\"6\" rx=\"5\" ry=\"3\"></ellipse><path d=\"M3 6v4c0 1.7 2.2 3 5 3s5-1.3 5-3V6\"></path><path d=\"M11 9.5c1-.9 2.5-1.5 4-1.5 2.8 0 5 1.3 5 3s-2.2 3-5 3c-1.5 0-3-.4-4-1.1\"></path><path d=\"M10 13v3c0 1.7 2.2 3 5 3s5-1.3 5-3v-5\"></path>";
    };
    readonly coupon: {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path>";
    };
    readonly 'dollar-sign': {
        readonly body: "<path d=\"M12 2v20\"></path><path d=\"M17 5.5A5 5 0 0 0 12 4c-3 0-5 1.5-5 3.5 0 5 10 2.5 10 7.5 0 2-2 3.5-5 3.5a6 6 0 0 1-5.5-2.5\"></path>";
    };
    readonly 'hand-coins': {
        readonly body: "<path d=\"M3 15h4l4 4h6a3 3 0 0 0 3-3\"></path><path d=\"M7 15l3-3h4a2 2 0 0 1 0 4h-3\"></path><circle cx=\"17\" cy=\"6\" r=\"3\"></circle><path d=\"M17 4v4\"></path><path d=\"M15 6h4\"></path>";
    };
    readonly 'package-check': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'package-open': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path><path d=\"m3 8 9 5 9-5\"></path>";
    };
    readonly 'package-plus': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 11v6\"></path><path d=\"M9 14h6\"></path>";
    };
    readonly 'package-x': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m9.5 12.5 5 5\"></path><path d=\"m14.5 12.5-5 5\"></path>";
    };
    readonly percent: {
        readonly body: "<path d=\"m19 5-14 14\"></path><circle cx=\"7\" cy=\"7\" r=\"2\"></circle><circle cx=\"17\" cy=\"17\" r=\"2\"></circle>";
    };
    readonly refund: {
        readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"M12 8v8\"></path><path d=\"M15 10.5A3 3 0 0 0 12 9c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly scale: {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
    };
    readonly ship: {
        readonly body: "<path d=\"M3 17h18l-2 4H5l-2-4z\"></path><path d=\"M5 17V8h14v9\"></path><path d=\"M9 8V4h6v4\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path>";
    };
    readonly 'shopping-cart-check': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path>";
    };
    readonly 'shopping-cart-plus': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M13 9v6\"></path><path d=\"M10 12h6\"></path>";
    };
    readonly warehouse: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path>";
    };
    readonly billable: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path><path d=\"M18 18l3 3\"></path>";
    };
    readonly billing: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly checkout: {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path><path d=\"M4 22h16\"></path>";
    };
    readonly dispute: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M12 13v2\"></path><path d=\"M12 17h.01\"></path><path d=\"m16 14 3 3\"></path><path d=\"m19 14-3 3\"></path>";
    };
    readonly dunning: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 14v3\"></path><path d=\"M15 20h.01\"></path>";
    };
    readonly estimate: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M8 9h4\"></path>";
    };
    readonly 'payment-failed': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"m9 13 6 4\"></path><path d=\"m15 13-6 4\"></path>";
    };
    readonly 'payment-link': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><path d=\"M13 15a3 3 0 0 0 4.2 0l1-1a3 3 0 0 0-4.2-4.2l-.6.6\"></path>";
    };
    readonly 'payment-method': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h4\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly payout: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path>";
    };
    readonly 'price-tag': {
        readonly body: "<path d=\"M20 12 12 20 3 11V3h8l9 9z\"></path><path d=\"M7 7h.01\"></path><path d=\"M12 8h4\"></path>";
    };
    readonly quote: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 15h8\"></path><path d=\"M8 11h5\"></path><path d=\"m16 17 2 2 4-4\"></path>";
    };
    readonly subscription: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"M16 15a3 3 0 1 0 2.8 4\"></path><path d=\"M19 15v3h-3\"></path>";
    };
    readonly 'tax-receipt': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 17 6-6\"></path><circle cx=\"10\" cy=\"12\" r=\"1\"></circle><circle cx=\"14\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly usage: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 16V9\"></path><path d=\"M12 16v-4\"></path><path d=\"M16 16v-7\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly 'cart-abandoned': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M12 9v4\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'discount-code': {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path><path d=\"M13 6v12\"></path>";
    };
    readonly fulfillment: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M17 15h4\"></path>";
    };
    readonly inventory: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M10 8h4\"></path>";
    };
    readonly 'inventory-alert': {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M12 7v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'order-cancelled': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
    };
    readonly 'order-check': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"m10 16 2 2 5-5\"></path>";
    };
    readonly 'order-pending': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
    };
    readonly 'pos-terminal': {
        readonly body: "<rect x=\"6\" y=\"3\" width=\"12\" height=\"18\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h2\"></path><path d=\"M14 15h1\"></path>";
    };
    readonly procurement: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly 'purchase-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"M8 8h3\"></path>";
    };
    readonly return: {
        readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"m21 8-6-4-6 4 6 4 6-4z\"></path><path d=\"M9 8v6l6 4 6-4V8\"></path>";
    };
    readonly 'shipment-track': {
        readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle><path d=\"M10 3h8\"></path><path d=\"m15 1 3 2-3 2\"></path>";
    };
    readonly 'shipping-label': {
        readonly body: "<path d=\"M6 3h12v18H6z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path><path d=\"M6 3l12 18\"></path>";
    };
    readonly 'account-payable': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 15h5\"></path><path d=\"m17 13 3 2-3 2\"></path>";
    };
    readonly 'account-receivable': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M20 15h-5\"></path><path d=\"m18 13-3 2 3 2\"></path>";
    };
    readonly 'bill-pay': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"m14 17 2 2 5-5\"></path>";
    };
    readonly 'card-terminal': {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h2\"></path><path d=\"M13 15h3\"></path><path d=\"M9 19h6\"></path>";
    };
    readonly 'cash-register': {
        readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M9 14h.01\"></path><path d=\"M13 14h.01\"></path><path d=\"M17 14h.01\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly chargeback: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 16H6v-3\"></path><path d=\"M6 13a5 5 0 0 0 8 4\"></path><path d=\"M15 13h3v3\"></path><path d=\"M18 16a5 5 0 0 0-8-4\"></path>";
    };
    readonly 'credit-note': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M16 14v6\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly 'debit-note': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly 'delivery-note': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M15 16h5\"></path><path d=\"m18 14 2 2-2 2\"></path>";
    };
    readonly 'payment-scheduled': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
    };
    readonly 'pricing-table': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 5v14\"></path><path d=\"M15 5v14\"></path><path d=\"M6 15h.01\"></path><path d=\"M12 15h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly 'revenue-recognition': {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 17V9\"></path><path d=\"M12 17V5\"></path><path d=\"M18 17v-6\"></path><path d=\"M8 5h8\"></path><path d=\"M12 3v4\"></path>";
    };
    readonly 'sales-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly vendor: {
        readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><circle cx=\"17\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly 'billing-cycle': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h5\"></path><path d=\"M16 15a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 13v3h-3\"></path>";
    };
    readonly 'collection-case': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 14v5\"></path><path d=\"M16 22h.01\"></path>";
    };
    readonly 'contract-value': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 13v6\"></path><path d=\"M18 15a2 2 0 0 0-2-1.5c-1 0-2 .5-2 1.5 0 2 4 .8 4 3 0 .9-1 1.5-2 1.5a3 3 0 0 1-2.5-1\"></path>";
    };
    readonly 'payment-gateway': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M17 11v2\"></path><path d=\"M17 17v2\"></path><path d=\"M13 15h2\"></path><path d=\"M19 15h2\"></path>";
    };
    readonly remittance: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path><path d=\"M6 15H3v-3\"></path><path d=\"m3 15 5-5\"></path>";
    };
    readonly 'revenue-ledger': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 3v18\"></path><path d=\"M12 8h4\"></path><path d=\"M12 12h4\"></path><path d=\"M12 16h3\"></path><path d=\"M16 6v12\"></path>";
    };
    readonly sku: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M8 15h8\"></path><path d=\"M9 18h6\"></path>";
    };
    readonly supplier: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><path d=\"M16 4h4\"></path>";
    };
    readonly 'tax-id': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 17 8-8\"></path><circle cx=\"9\" cy=\"10\" r=\"1\"></circle><circle cx=\"15\" cy=\"16\" r=\"1\"></circle><path d=\"M8 7h4\"></path>";
    };
    readonly till: {
        readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M8 14h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M7 18h10\"></path>";
    };
    readonly trial: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M12 11v5\"></path><path d=\"M9.5 13.5h5\"></path>";
    };
    readonly wholesale: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M4 8h16\"></path><path d=\"M9 5h6\"></path>";
    };
};

export { commerceIcons };
