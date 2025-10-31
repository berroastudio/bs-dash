import dash
from dash import html, dcc, Input, Output, State
import dash_bootstrap_components as dbc
import webbrowser
import threading
import time

# Inicializar managers
from models.sequences import SequenceManager
from models.cash_management import CashManager

sequence_manager = SequenceManager()
cash_manager = CashManager()

# Función para abrir navegador automáticamente
def open_browser():
    time.sleep(2)  # Esperar que el servidor inicie
    webbrowser.open("http://127.0.0.1:8050")

# Crear aplicación Dash
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True
)

app.title = "BS Dash - Berroa Studio"

# CSS EXACTO de tu dashboard.html
app.index_string = '''
<!DOCTYPE html>
<html lang="es">
<head>
    {%metas%}
    <title>{%title%}</title>
    {%favicon%}
    {%css%}
    <style>
        /* ESTILOS EXACTOS DE TU DASHBOARD */
        body {
            background-color: #fbfbfb;
            font-family: 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        
        .bs-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .bs-stat-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease;
        }
        
        .bs-stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .bs-module-card {
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .bs-module-card:hover {
            border-color: #3b82f6;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
        }
        
        .bs-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            text-decoration: none;
            cursor: pointer;
        }
        
        .bs-btn:hover {
            background: #f9fafb;
            border-color: #9ca3af;
            text-decoration: none;
            color: #374151;
        }
        
        .bs-btn-primary {
            background: #3b82f6;
            border-color: #3b82f6;
            color: white;
        }
        
        .bs-btn-primary:hover {
            background: #2563eb;
            border-color: #2563eb;
            color: white;
        }
        
        .icon-container {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid;
        }
        
        .bg-blue-100 { background-color: #dbeafe; }
        .bg-green-100 { background-color: #dcfce7; }
        .bg-purple-100 { background-color: #f3e8ff; }
        .bg-orange-100 { background-color: #ffedd5; }
        .bg-red-100 { background-color: #fee2e2; }
        .bg-gray-100 { background-color: #f3f4f6; }
        
        .border-blue-200 { border-color: #bfdbfe; }
        .border-green-200 { border-color: #bbf7d0; }
        .border-purple-200 { border-color: #e9d5ff; }
        .border-orange-200 { border-color: #fed7aa; }
        .border-red-200 { border-color: #fecaca; }
        .border-gray-300 { border-color: #d1d5db; }
        
        .text-blue-600 { color: #2563eb; }
        .text-green-600 { color: #16a34a; }
        .text-purple-600 { color: #9333ea; }
        .text-orange-600 { color: #ea580c; }
        .text-red-600 { color: #dc2626; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-800 { color: #1f2937; }
        
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slide-in {
            animation: slideIn 0.5s ease-out;
        }
        
        .animate-scale-in {
            animation: scaleIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        /* Flex utilities */
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        
        /* Text utilities */
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        
        /* Spacing */
        .p-4 { padding: 1rem; }
        .p-3 { padding: 0.75rem; }
        .p-6 { padding: 1.5rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        
        .m-4 { margin: 1rem; }
        .mx-4 { margin-left: 1rem; margin-right: 1rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-3 { margin-top: 0.75rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        
        .mr-2 { margin-right: 0.5rem; }
        .mr-3 { margin-right: 0.75rem; }
        
        /* Width/Height */
        .w-10 { width: 2.5rem; }
        .w-12 { width: 3rem; }
        .w-full { width: 100%; }
        .h-10 { height: 2.5rem; }
        .h-12 { height: 3rem; }
        
        /* Border radius */
        .rounded-full { border-radius: 9999px; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }
        
        /* Grid */
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        
        /* Responsive */
        @media (min-width: 768px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        
        @media (min-width: 1024px) {
            .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .lg\\:col-span-2 { grid-column: span 2 / span 2; }
        }
        
        .max-w-7xl { max-width: 80rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .ms-2 { margin-left: 0.5rem; }
        .ms-auto { margin-left: auto; }
    </style>
</head>
<body>
    {%app_entry%}
    <footer>
        {%config%}
        {%scripts%}
        {%renderer%}
    </footer>
</body>
</html>
'''

# Layout EXACTO de tu dashboard.html
app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    
    # Header exacto de tu dashboard
    html.Header(className="bs-card mx-4 mt-4 mb-6", children=[
        html.Div(className="flex items-center justify-between p-4", children=[
            # Logo
            html.Div(className="flex items-center gap-3", children=[
                html.Div(className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200", children=[
                    html.I(className="bi bi-grid-3x3-gap-fill text-blue-600")
                ]),
                html.Div(children=[
                    html.H1("BS Dash", className="text-xl font-bold text-gray-800"),
                    html.P("Berroa Studio", className="text-sm text-gray-600", id="empresaNombre")
                ])
            ]),

            # User Info
            html.Div(className="flex items-center gap-4", children=[
                html.Div(className="text-right", children=[
                    html.P("John Berroa", className="font-medium text-gray-800", id="userName"),
                    html.P("Administrador", className="text-xs text-gray-500")
                ]),
                html.Div(className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300", children=[
                    html.I(className="bi bi-person text-gray-600")
                ]),
                html.Button(
                    className="bs-btn bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
                    children=[
                        html.I(className="bi bi-box-arrow-right"),
                        "Salir"
                    ],
                    id="logout-btn"
                )
            ])
        ])
    ]),

    # Main Content exacto
    html.Main(className="max-w-7xl mx-auto px-4", children=[
        # Stats Cards
        html.Div(className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children=[
            # Ventas
            html.Div(className="bs-stat-card p-4 animate-fade-in", children=[
                html.Div(className="flex items-center justify-between", children=[
                    html.Div(children=[
                        html.P("Ventas Hoy", className="text-sm text-gray-500"),
                        html.H3("$4,250", className="text-2xl font-bold text-gray-800 mt-1"),
                        html.P(className="text-xs text-green-500 mt-1", children=[
                            "↑ 12% vs ayer"
                        ])
                    ]),
                    html.Div(className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border border-green-200", children=[
                        html.I(className="bi bi-currency-dollar text-green-600 text-xl")
                    ])
                ])
            ]),

            # Inventario
            html.Div(className="bs-stat-card p-4 animate-fade-in", style={'animationDelay': '0.1s'}, children=[
                html.Div(className="flex items-center justify-between", children=[
                    html.Div(children=[
                        html.P("Productos Stock", className="text-sm text-gray-500"),
                        html.H3("1,248", className="text-2xl font-bold text-gray-800 mt-1"),
                        html.P(className="text-xs text-red-500 mt-1", children=[
                            "⚠️ 15 bajos"
                        ])
                    ]),
                    html.Div(className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200", children=[
                        html.I(className="bi bi-box-seam text-blue-600 text-xl")
                    ])
                ])
            ]),

            # Órdenes
            html.Div(className="bs-stat-card p-4 animate-fade-in", style={'animationDelay': '0.2s'}, children=[
                html.Div(className="flex items-center justify-between", children=[
                    html.Div(children=[
                        html.P("Órdenes Pendientes", className="text-sm text-gray-500"),
                        html.H3("24", className="text-2xl font-bold text-gray-800 mt-1"),
                        html.P(className="text-xs text-yellow-500 mt-1", children=[
                            "⏰ 5 sin asignar"
                        ])
                    ]),
                    html.Div(className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200", children=[
                        html.I(className="bi bi-clipboard-check text-purple-600 text-xl")
                    ])
                ])
            ]),

            # Clientes
            html.Div(className="bs-stat-card p-4 animate-fade-in", style={'animationDelay': '0.3s'}, children=[
                html.Div(className="flex items-center justify-between", children=[
                    html.Div(children=[
                        html.P("Clientes Activos", className="text-sm text-gray-500"),
                        html.H3("156", className="text-2xl font-bold text-gray-800 mt-1"),
                        html.P(className="text-xs text-gray-500 mt-1", children=[
                            "👥 Total registrados"
                        ])
                    ]),
                    html.Div(className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200", children=[
                        html.I(className="bi bi-people text-orange-600 text-xl")
                    ])
                ])
            ])
        ]),

        # Módulos Principales
        html.Div(className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8", children=[
            # Módulo POS
            html.Div(className="lg:col-span-2", children=[
                html.Div(className="bs-card p-6 animate-slide-in", children=[
                    html.Div(className="flex items-center justify-between mb-6", children=[
                        html.H2(className="text-xl font-bold text-gray-800 flex items-center gap-2", children=[
                            "💳 Punto de Venta"
                        ]),
                        dbc.Button("Nueva Venta", color="primary", href="/pos", className="bs-btn-primary")
                    ]),

                    html.Div(className="grid grid-cols-1 md:grid-cols-2 gap-4", children=[
                        html.Div(className="bs-module-card p-4", children=[
                            html.H3(className="font-medium text-gray-700 mb-2 flex items-center gap-2", children=[
                                "⚡ Venta Rápida"
                            ]),
                            html.P("Procesa una venta rápida con productos frecuentes", className="text-sm text-gray-500 mb-3"),
                            dbc.Button("Iniciar", color="secondary", href="/pos-rapida", className="w-100")
                        ]),

                        html.Div(className="bs-module-card p-4", children=[
                            html.H3(className="font-medium text-gray-700 mb-2 flex items-center gap-2", children=[
                                "📋 Venta Detallada"
                            ]),
                            html.P("Procesa una venta con múltiples productos", className="text-sm text-gray-500 mb-3"),
                            dbc.Button("Iniciar", color="secondary", href="/pos-detallada", className="w-100")
                        ])
                    ])
                ])
            ]),

            # Módulos Rápidos
            html.Div(className="bs-card p-6 animate-scale-in", children=[
                html.H2(className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children=[
                    "📦 Módulos"
                ]),

                html.Div(className="space-y-3", children=[
                    dbc.NavLink(
                        html.Div(className="bs-module-card flex items-center p-3", children=[
                            html.Div(className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 border border-blue-200", children=["📦"]),
                            html.Div(children=[
                                html.H3("Inventario", className="font-medium text-gray-800"),
                                html.P("Gestionar productos y stock", className="text-xs text-gray-500")
                            ])
                        ]),
                        href="/inventario"
                    ),

                    dbc.NavLink(
                        html.Div(className="bs-module-card flex items-center p-3", children=[
                            html.Div(className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 border border-green-200", children=["📄"]),
                            html.Div(children=[
                                html.H3("Cotizaciones", className="font-medium text-gray-800"),
                                html.P("Crear y gestionar cotizaciones", className="text-xs text-gray-500")
                            ])
                        ]),
                        href="/cotizaciones"
                    ),

                    dbc.NavLink(
                        html.Div(className="bs-module-card flex items-center p-3", children=[
                            html.Div(className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 border border-purple-200", children=["✅"]),
                            html.Div(children=[
                                html.H3("Órdenes", className="font-medium text-gray-800"),
                                html.P("Ver y asignar órdenes", className="text-xs text-gray-500")
                            ])
                        ]),
                        href="/ordenes"
                    ),

                    dbc.NavLink(
                        html.Div(className="bs-module-card flex items-center p-3", children=[
                            html.Div(className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 border border-orange-200", children=["🧾"]),
                            html.Div(children=[
                                html.H3("Facturación", className="font-medium text-gray-800"),
                                html.P("Gestión de facturas", className="text-xs text-gray-500")
                            ])
                        ]),
                        href="/facturacion"
                    ),

                    dbc.NavLink(
                        html.Div(className="bs-module-card flex items-center p-3", children=[
                            html.Div(className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 border border-purple-200", children=["⚙️"]),
                            html.Div(children=[
                                html.H3("Configuración", className="font-medium text-gray-800"),
                                html.P("Ajustes del sistema", className="text-xs text-gray-500")
                            ])
                        ]),
                        href="/configuracion"
                    ),

                    # NUEVOS MÓDULOS PYTHON
                    dbc.NavLink(
                        html.Div(className="bs-module-card flex items-center p-3", children=[
                            html.Div(className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 border border-blue-200", children=["🔢"]),
                            html.Div(children=[
                                html.H3("Secuencias", className="font-medium text-gray-800"),
                                html.P("Configurar números de secuencia", className="text-xs text-gray-500")
                            ])
                        ]),
                        href="/secuencias"
                    ),

                    dbc.NavLink(
                        html.Div(className="bs-module-card flex items-center p-3", children=[
                            html.Div(className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 border border-green-200", children=["💰"]),
                            html.Div(children=[
                                html.H3("Caja", className="font-medium text-gray-800"),
                                html.P("Gestión de apertura/cierre", className="text-xs text-gray-500")
                            ])
                        ]),
                        href="/caja"
                    )
                ])
            ])
        ])
    ]),
    
    # Área de contenido para módulos
    html.Div(id="page-content", className="mt-8")
])

# Importar módulos Python
try:
    from modules.secuencias import layout as secuencias_layout
    from modules.caja import layout as caja_layout
except ImportError as e:
    print(f"⚠️ Error importando módulos: {e}")
    secuencias_layout = html.Div([html.H3("🔢 Secuencias"), html.P("Módulo no disponible")])
    caja_layout = html.Div([html.H3("💰 Caja"), html.P("Módulo no disponible")])

# Layouts para otros módulos
inventario_layout = html.Div([html.H3("📦 Inventario"), html.P("Módulo en desarrollo")])
pos_layout = html.Div([html.H3("💳 Punto de Venta"), html.P("Módulo en desarrollo")])
configuracion_layout = html.Div([html.H3("⚙️ Configuración"), html.P("Módulo en desarrollo")])
cotizaciones_layout = html.Div([html.H3("📄 Cotizaciones"), html.P("Módulo en desarrollo")])
ordenes_layout = html.Div([html.H3("✅ Órdenes"), html.P("Módulo en desarrollo")])
facturacion_layout = html.Div([html.H3("🧾 Facturación"), html.P("Módulo en desarrollo")])

# Callback para navegación
@app.callback(
    Output("page-content", "children"),
    [Input("url", "pathname")]
)
def display_page(pathname):
    if pathname == "/secuencias":
        return secuencias_layout
    elif pathname == "/caja":
        return caja_layout
    elif pathname == "/inventario":
        return inventario_layout
    elif pathname == "/pos":
        return pos_layout
    elif pathname == "/configuracion":
        return configuracion_layout
    elif pathname == "/cotizaciones":
        return cotizaciones_layout
    elif pathname == "/ordenes":
        return ordenes_layout
    elif pathname == "/facturacion":
        return facturacion_layout
    else:
        return html.Div()  # Vacío para dashboard principal

if __name__ == '__main__':
    print("🚀 Iniciando BS Dashboard...")
    print("🎨 Diseño EXACTO de dashboard.html cargado")
    print("📊 Módulos Python integrados: Secuencias, Caja")
    print("🌐 Abriendo automáticamente: http://127.0.0.1:8050")
    
    # Abrir navegador automáticamente
    threading.Thread(target=open_browser).start()
    
    app.run(debug=False, host='0.0.0.0', port=8050)