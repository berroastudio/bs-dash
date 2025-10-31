import dash
from dash import html, dcc, Input, Output, State, callback_context
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
    time.sleep(3)
    webbrowser.open("http://127.0.0.1:8050")

# Crear aplicación Dash
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True
)

app.title = "BS Dash - Berroa Studio"

# CSS EXACTO con iconos corregidos
app.index_string = '''
<!DOCTYPE html>
<html lang="es">
<head>
    {%metas%}
    <title>{%title%}</title>
    {%favicon%}
    {%css%}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
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
        
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        
        .p-4 { padding: 1rem; }
        .p-3 { padding: 0.75rem; }
        .p-6 { padding: 1.5rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        
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
        
        .w-10 { width: 2.5rem; }
        .w-12 { width: 3rem; }
        .w-full { width: 100%; }
        .h-10 { height: 2.5rem; }
        .h-12 { height: 3rem; }
        
        .rounded-full { border-radius: 9999px; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }
        
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        
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
        
        .hidden { display: none; }
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

# Layout principal con login
app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    dcc.Store(id='session-store', data={'isLoggedIn': False}),
    
    # Login Page
    html.Div(id='login-page', className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8', children=[
        html.Div(className='sm:mx-auto sm:w-full sm:max-w-md', children=[
            html.Div(className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10', children=[
                html.Div(className='text-center mb-8', children=[
                    html.Div(className='mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center', children=[
                        html.I(className='bi bi-grid-3x3-gap-fill text-white')
                    ]),
                    html.H2('BS Dash', className='mt-6 text-3xl font-extrabold text-gray-900'),
                    html.P('Inicia sesión en tu cuenta', className='mt-2 text-sm text-gray-600')
                ]),
                
                html.Div(className='space-y-6', children=[
                    html.Div(children=[
                        dbc.Label('Usuario', className='block text-sm font-medium text-gray-700'),
                        dbc.Input(
                            id='username-input',
                            type='text',
                            placeholder='admin',
                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        )
                    ]),
                    
                    html.Div(children=[
                        dbc.Label('Contraseña', className='block text-sm font-medium text-gray-700'),
                        dbc.Input(
                            id='password-input',
                            type='password',
                            placeholder='admin',
                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        )
                    ]),
                    
                    html.Div(children=[
                        dbc.Button(
                            'Iniciar Sesión',
                            id='login-button',
                            color='primary',
                            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )
                    ]),
                    
                    html.Div(id='login-feedback')
                ])
            ])
        ])
    ]),
    
    # Dashboard Page (oculto inicialmente)
    html.Div(id='dashboard-page', className='hidden', children=[
        # Header
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
                    dbc.Button(
                        "Salir",
                        id="logout-btn",
                        color="danger",
                        className="bs-btn bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    )
                ])
            ])
        ]),

        # Main Content
        html.Main(className="max-w-7xl mx-auto px-4", children=[
            # Stats Cards
            html.Div(className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children=[
                # Ventas
                html.Div(className="bs-stat-card p-4", children=[
                    html.Div(className="flex items-center justify-between", children=[
                        html.Div(children=[
                            html.P("Ventas Hoy", className="text-sm text-gray-500"),
                            html.H3("$4,250", className="text-2xl font-bold text-gray-800 mt-1"),
                            html.P("↑ 12% vs ayer", className="text-xs text-green-500 mt-1")
                        ]),
                        html.Div(className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border border-green-200", children=[
                            html.I(className="bi bi-currency-dollar text-green-600 text-xl")
                        ])
                    ])
                ]),

                # Inventario
                html.Div(className="bs-stat-card p-4", children=[
                    html.Div(className="flex items-center justify-between", children=[
                        html.Div(children=[
                            html.P("Productos Stock", className="text-sm text-gray-500"),
                            html.H3("1,248", className="text-2xl font-bold text-gray-800 mt-1"),
                            html.P("⚠️ 15 bajos", className="text-xs text-red-500 mt-1")
                        ]),
                        html.Div(className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200", children=[
                            html.I(className="bi bi-box-seam text-blue-600 text-xl")
                        ])
                    ])
                ]),

                # Órdenes
                html.Div(className="bs-stat-card p-4", children=[
                    html.Div(className="flex items-center justify-between", children=[
                        html.Div(children=[
                            html.P("Órdenes Pendientes", className="text-sm text-gray-500"),
                            html.H3("24", className="text-2xl font-bold text-gray-800 mt-1"),
                            html.P("⏰ 5 sin asignar", className="text-xs text-yellow-500 mt-1")
                        ]),
                        html.Div(className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200", children=[
                            html.I(className="bi bi-clipboard-check text-purple-600 text-xl")
                        ])
                    ])
                ]),

                # Clientes
                html.Div(className="bs-stat-card p-4", children=[
                    html.Div(className="flex items-center justify-between", children=[
                        html.Div(children=[
                            html.P("Clientes Activos", className="text-sm text-gray-500"),
                            html.H3("156", className="text-2xl font-bold text-gray-800 mt-1"),
                            html.P("👥 Total registrados", className="text-xs text-gray-500 mt-1")
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
                    html.Div(className="bs-card p-6", children=[
                        html.Div(className="flex items-center justify-between mb-6", children=[
                            html.H2("💳 Punto de Venta", className="text-xl font-bold text-gray-800"),
                            dbc.Button("Nueva Venta", id="pos-btn", color="primary", className="bs-btn-primary")
                        ]),
                        html.Div(className="grid grid-cols-1 md:grid-cols-2 gap-4", children=[
                            html.Div(className="bs-module-card p-4", children=[
                                html.H3("⚡ Venta Rápida", className="font-medium text-gray-700 mb-2"),
                                html.P("Procesa una venta rápida con productos frecuentes", className="text-sm text-gray-500 mb-3"),
                                dbc.Button("Iniciar", id="venta-rapida-btn", color="secondary", className="w-100")
                            ]),
                            html.Div(className="bs-module-card p-4", children=[
                                html.H3("📋 Venta Detallada", className="font-medium text-gray-700 mb-2"),
                                html.P("Procesa una venta con múltiples productos", className="text-sm text-gray-500 mb-3"),
                                dbc.Button("Iniciar", id="venta-detallada-btn", color="secondary", className="w-100")
                            ])
                        ])
                    ])
                ]),

                # Módulos Rápidos
                html.Div(className="bs-card p-6", children=[
                    html.H2("📦 Módulos", className="text-xl font-bold text-gray-800 mb-4"),
                    html.Div(className="space-y-3", children=[
                        dbc.Button("📦 Inventario", id="inventario-btn", color="light", className="bs-module-card w-full text-left justify-start"),
                        dbc.Button("📄 Cotizaciones", id="cotizaciones-btn", color="light", className="bs-module-card w-full text-left justify-start"),
                        dbc.Button("✅ Órdenes", id="ordenes-btn", color="light", className="bs-module-card w-full text-left justify-start"),
                        dbc.Button("🧾 Facturación", id="facturacion-btn", color="light", className="bs-module-card w-full text-left justify-start"),
                        dbc.Button("⚙️ Configuración", id="configuracion-btn", color="light", className="bs-module-card w-full text-left justify-start"),
                        dbc.Button("🔢 Secuencias", id="secuencias-btn", color="light", className="bs-module-card w-full text-left justify-start"),
                        dbc.Button("💰 Caja", id="caja-btn", color="light", className="bs-module-card w-full text-left justify-start")
                    ])
                ])
            ])
        ]),
        
        # Área de contenido para módulos
        html.Div(id="module-content", className="mt-8")
    ])
])

# Importar módulos Python
try:
    from modules.secuencias import layout as secuencias_layout
    from modules.caja import layout as caja_layout
except ImportError as e:
    print(f"⚠️ Error importando módulos: {e}")
    secuencias_layout = html.Div([html.H3("🔢 Secuencias"), html.P("Módulo no disponible")])
    caja_layout = html.Div([html.H3("💰 Caja"), html.P("Módulo no disponible")])

# Layouts para módulos
inventario_layout = html.Div([html.H3("📦 Inventario"), html.P("Sistema de gestión de productos")])
pos_layout = html.Div([html.H3("💳 Punto de Venta"), html.P("Sistema de ventas")])
configuracion_layout = html.Div([html.H3("⚙️ Configuración"), html.P("Ajustes del sistema")])
cotizaciones_layout = html.Div([html.H3("📄 Cotizaciones"), html.P("Crear y gestionar cotizaciones")])
ordenes_layout = html.Div([html.H3("✅ Órdenes"), html.P("Ver y asignar órdenes")])
facturacion_layout = html.Div([html.H3("🧾 Facturación"), html.P("Gestión de facturas")])

# Callback para login
@app.callback(
    [Output('login-page', 'className'),
     Output('dashboard-page', 'className'),
     Output('login-feedback', 'children')],
    [Input('login-button', 'n_clicks')],
    [State('username-input', 'value'),
     State('password-input', 'value')]
)
def login(n_clicks, username, password):
    if n_clicks:
        if username == "admin" and password == "admin":
            return 'hidden', '', dbc.Alert("✅ Login exitoso", color="success", duration=2000)
        else:
            return '', 'hidden', dbc.Alert("❌ Usuario o contraseña incorrectos", color="danger")
    return '', 'hidden', ''

# Callback para logout
@app.callback(
    [Output('login-page', 'className', allow_duplicate=True),
     Output('dashboard-page', 'className', allow_duplicate=True)],
    [Input('logout-btn', 'n_clicks')],
    prevent_initial_call=True
)
def logout(n_clicks):
    if n_clicks:
        return '', 'hidden'
    return dash.no_update, dash.no_update

# Callback para módulos
@app.callback(
    Output("module-content", "children"),
    [Input("inventario-btn", "n_clicks"),
     Input("cotizaciones-btn", "n_clicks"),
     Input("ordenes-btn", "n_clicks"),
     Input("facturacion-btn", "n_clicks"),
     Input("configuracion-btn", "n_clicks"),
     Input("secuencias-btn", "n_clicks"),
     Input("caja-btn", "n_clicks"),
     Input("pos-btn", "n_clicks"),
     Input("venta-rapida-btn", "n_clicks"),
     Input("venta-detallada-btn", "n_clicks")],
    prevent_initial_call=True
)
def show_module(inv, cot, ord, fac, conf, sec, caj, pos, rap, det):
    ctx = callback_context
    if not ctx.triggered:
        return html.Div()
    
    button_id = ctx.triggered[0]['prop_id'].split('.')[0]
    
    if button_id == 'inventario-btn':
        return inventario_layout
    elif button_id == 'cotizaciones-btn':
        return cotizaciones_layout
    elif button_id == 'ordenes-btn':
        return ordenes_layout
    elif button_id == 'facturacion-btn':
        return facturacion_layout
    elif button_id == 'configuracion-btn':
        return configuracion_layout
    elif button_id == 'secuencias-btn':
        return secuencias_layout
    elif button_id == 'caja-btn':
        return caja_layout
    elif button_id == 'pos-btn':
        return pos_layout
    elif button_id in ['venta-rapida-btn', 'venta-detallada-btn']:
        return pos_layout
    
    return html.Div()

if __name__ == '__main__':
    print("🚀 Iniciando BS Dashboard...")
    print("🔐 Sistema de login activado")
    print("📊 Módulos Python: Secuencias, Caja")
    print("🌐 Abriendo automáticamente: http://127.0.0.1:8050")
    
    # Abrir navegador automáticamente
    threading.Thread(target=open_browser).start()
    
    app.run(debug=False, host='0.0.0.0', port=8050)