import dash
from dash import html, dcc, Input, Output, State, callback_context, dash_table
import dash_bootstrap_components as dbc
import os
import json
from datetime import datetime

# Inicializar managers
from models.sequences import SequenceManager
from models.cash_management import CashManager

sequence_manager = SequenceManager()
cash_manager = CashManager()

# Crear aplicación Dash
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True
)

app.title = "BS Dash - Dashboard"

# CSS personalizado para replicar tu diseño exacto
app.index_string = '''
<!DOCTYPE html>
<html lang="es">
    <head>
        {%metas%}
        <title>{%title%}</title>
        {%favicon%}
        {%css%}
        <style>
            /* REPLICANDO TU DISEÑO EXACTO */
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
            
            .border-blue-200 { border-color: #bfdbfe; }
            .border-green-200 { border-color: #bbf7d0; }
            .border-purple-200 { border-color: #e9d5ff; }
            .border-orange-200 { border-color: #fed7aa; }
            .border-red-200 { border-color: #fecaca; }
            
            .text-blue-600 { color: #2563eb; }
            .text-green-600 { color: #16a34a; }
            .text-purple-600 { color: #9333ea; }
            .text-orange-600 { color: #ea580c; }
            .text-red-600 { color: #dc2626; }
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

# Layout principal - RÉPLICA EXACTA de tu dashboard.html
app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    dcc.Store(id='session-store', data={'isLoggedIn': True, 'userName': 'John Berroa', 'empresaNombre': 'Berroa Studio'}),
    
    # Header - Réplica exacta
    html.Header(className="bs-card mx-4 mt-4 mb-6", children=[
        html.Div(className="flex items-center justify-between p-4", children=[
            # Logo
            html.Div(className="flex items-center gap-3", children=[
                html.Div(className="icon-container bg-blue-100 border-blue-200", children=[
                    html.I(className="bi bi-grid-3x3-gap-fill text-blue-600")
                ]),
                html.Div(children=[
                    html.H1("BS Dash", className="text-xl font-bold text-gray-800"),
                    html.P(id="empresaNombre", children="Berroa Studio", className="text-sm text-gray-600")
                ])
            ]),
            
            # User Info - CORREGIDO
            html.Div(className="flex items-center gap-4", children=[
                html.Div(className="text-right", children=[
                    html.P(id="userName", children="John Berroa", className="font-medium text-gray-800"),
                    html.P("Administrador", className="text-xs text-gray-500")
                ]),
                html.Div(className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300", children=[
                    html.I(className="bi bi-person text-gray-600")
                ]),
                html.Button(
                    id="logout-btn",
                    className="bs-btn bg-red-100 text-red-600 border-red-200 hover:bg-red-200",
                    children=[
                        html.I(className="bi bi-box-arrow-right mr-2"),
                        "Salir"
                    ]
                )
            ])
        ])
    ]),
    
    # Main Content
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
                            html.I(className="bi bi-arrow-up mr-1"),
                            "12% vs ayer"
                        ])
                    ]),
                    html.Div(className="icon-container bg-green-100 border-green-200", children=[
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
                            html.I(className="bi bi-exclamation-triangle mr-1"),
                            "15 bajos"
                        ])
                    ]),
                    html.Div(className="icon-container bg-blue-100 border-blue-200", children=[
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
                            html.I(className="bi bi-clock mr-1"),
                            "5 sin asignar"
                        ])
                    ]),
                    html.Div(className="icon-container bg-purple-100 border-purple-200", children=[
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
                            html.I(className="bi bi-people mr-1"),
                            "Total registrados"
                        ])
                    ]),
                    html.Div(className="icon-container bg-orange-100 border-orange-200", children=[
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
                            html.I(className="bi bi-cash-coin text-green-600"),
                            "Punto de Venta"
                        ]),
                        html.A(
                            "Nueva Venta",
                            href="/pos",
                            className="bs-btn bs-btn-primary",
                            children=[
                                html.I(className="bi bi-plus mr-2"),
                                "Nueva Venta"
                            ]
                        )
                    ]),
                    
                    html.Div(className="grid grid-cols-1 md:grid-cols-2 gap-4", children=[
                        html.Div(className="bs-module-card p-4", children=[
                            html.H3(className="font-medium text-gray-700 mb-2 flex items-center gap-2", children=[
                                html.I(className="bi bi-lightning text-yellow-600"),
                                "Venta Rápida"
                            ]),
                            html.P("Procesa una venta rápida con productos frecuentes", className="text-sm text-gray-500 mb-3"),
                            html.A(
                                "Iniciar",
                                href="/pos",
                                className="bs-btn w-full justify-center",
                                children=[
                                    html.I(className="bi bi-play mr-2"),
                                    "Iniciar"
                                ]
                            )
                        ]),
                        
                        html.Div(className="bs-module-card p-4", children=[
                            html.H3(className="font-medium text-gray-700 mb-2 flex items-center gap-2", children=[
                                html.I(className="bi bi-list-check text-blue-600"),
                                "Venta Detallada"
                            ]),
                            html.P("Procesa una venta con múltiples productos", className="text-sm text-gray-500 mb-3"),
                            html.Button(
                                className="bs-btn w-full justify-center",
                                children=[
                                    html.I(className="bi bi-play mr-2"),
                                    "Iniciar"
                                ]
                            )
                        ])
                    ])
                ])
            ]),
            
            # Módulos Rápidos
            html.Div(className="bs-card p-6 animate-scale-in", children=[
                html.H2(className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children=[
                    html.I(className="bi bi-grid-3x3-gap text-purple-600"),
                    "Módulos"
                ]),
                
                html.Div(className="space-y-3", children=[
                    # Inventario
                    html.A(
                        href="/inventario",
                        className="bs-module-card flex items-center p-3",
                        children=[
                            html.Div(className="icon-container bg-blue-100 border-blue-200 mr-3", children=[
                                html.I(className="bi bi-box-seam text-blue-600")
                            ]),
                            html.Div(children=[
                                html.H3("Inventario", className="font-medium text-gray-800"),
                                html.P("Gestionar productos y stock", className="text-xs text-gray-500")
                            ])
                        ]
                    ),
                    
                    # Cotizaciones
                    html.A(
                        href="/cotizaciones",
                        className="bs-module-card flex items-center p-3",
                        children=[
                            html.Div(className="icon-container bg-green-100 border-green-200 mr-3", children=[
                                html.I(className="bi bi-file-text text-green-600")
                            ]),
                            html.Div(children=[
                                html.H3("Cotizaciones", className="font-medium text-gray-800"),
                                html.P("Crear y gestionar cotizaciones", className="text-xs text-gray-500")
                            ])
                        ]
                    ),
                    
                    # Órdenes
                    html.A(
                        href="/ordenes",
                        className="bs-module-card flex items-center p-3",
                        children=[
                            html.Div(className="icon-container bg-purple-100 border-purple-200 mr-3", children=[
                                html.I(className="bi bi-clipboard-check text-purple-600")
                            ]),
                            html.Div(children=[
                                html.H3("Órdenes", className="font-medium text-gray-800"),
                                html.P("Ver y asignar órdenes", className="text-xs text-gray-500")
                            ])
                        ]
                    ),
                    
                    # Facturación
                    html.A(
                        href="/facturacion",
                        className="bs-module-card flex items-center p-3",
                        children=[
                            html.Div(className="icon-container bg-orange-100 border-orange-200 mr-3", children=[
                                html.I(className="bi bi-credit-card text-orange-600")
                            ]),
                            html.Div(children=[
                                html.H3("Facturación", className="font-medium text-gray-800"),
                                html.P("Gestión de facturas", className="text-xs text-gray-500")
                            ])
                        ]
                    ),
                    
                    # Configuración
                    html.A(
                        href="/configuracion",
                        className="bs-module-card flex items-center p-3",
                        children=[
                            html.Div(className="icon-container bg-purple-100 border-purple-200 mr-3", children=[
                                html.I(className="bi bi-gear text-purple-600")
                            ]),
                            html.Div(children=[
                                html.H3("Configuración", className="font-medium text-gray-800"),
                                html.P("Ajustes del sistema", className="text-xs text-gray-500")
                            ])
                        ]
                    ),
                    
                    # SECUENCIAS (NUEVO MÓDULO)
                    html.A(
                        href="/secuencias",
                        className="bs-module-card flex items-center p-3",
                        children=[
                            html.Div(className="icon-container bg-blue-100 border-blue-200 mr-3", children=[
                                html.I(className="bi bi-list-ol text-blue-600")
                            ]),
                            html.Div(children=[
                                html.H3("Secuencias", className="font-medium text-gray-800"),
                                html.P("Configurar números de secuencia", className="text-xs text-gray-500")
                            ])
                        ]
                    ),
                    
                    # CAJA (NUEVO MÓDULO)
                    html.A(
                        href="/caja",
                        className="bs-module-card flex items-center p-3",
                        children=[
                            html.Div(className="icon-container bg-green-100 border-green-200 mr-3", children=[
                                html.I(className="bi bi-cash-coin text-green-600")
                            ]),
                            html.Div(children=[
                                html.H3("Caja", className="font-medium text-gray-800"),
                                html.P("Gestión de apertura/cierre", className="text-xs text-gray-500")
                            ])
                        ]
                    )
                ])
            ])
        ])
    ]),
    
    # Área de contenido dinámico para módulos
    html.Div(id="module-content")
])

# Importar módulos Python
try:
    from modules.secuencias import layout as secuencias_layout
    from modules.caja import layout as caja_layout
except ImportError as e:
    print(f"⚠️ Error importando módulos: {e}")
    secuencias_layout = html.Div(["Módulo de secuencias no disponible"])
    caja_layout = html.Div(["Módulo de caja no disponible"])

# Layouts para otros módulos (placeholders por ahora)
inventario_layout = html.Div([
    html.H2("📦 Inventario"),
    html.P("Módulo de inventario - En desarrollo")
])

pos_layout = html.Div([
    html.H2("💳 Punto de Venta"),
    html.P("Módulo POS - En desarrollo")
])

configuracion_layout = html.Div([
    html.H2("⚙️ Configuración"),
    html.P("Configuración del sistema - En desarrollo")
])

# Callback para navegación
@app.callback(
    Output("module-content", "children"),
    [Input("url", "pathname")]
)
def display_module(pathname):
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
    elif pathname in ["/cotizaciones", "/ordenes", "/facturacion"]:
        return html.Div([
            html.H2(f"Módulo {pathname[1:].capitalize()}"),
            html.P("Módulo en desarrollo")
        ])
    else:
        return html.Div()  # Vacío para dashboard principal

# Callback para logout
@app.callback(
    Output("url", "pathname"),
    [Input("logout-btn", "n_clicks")],
    prevent_initial_call=True
)
def logout(n_clicks):
    if n_clicks:
        return "/login"
    return dash.no_update

if __name__ == '__main__':
    print("🚀 Iniciando BS Dashboard...")
    print("🎨 Diseño replicado 100% del dashboard.html")
    print("📊 Módulos Python integrados")
    print("🌐 Servidor en: http://localhost:8050")
    app.run(debug=False, host='0.0.0.0', port=8050)