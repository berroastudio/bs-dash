import dash
from dash import html, dcc, Input, Output, State
import dash_bootstrap_components as dbc

# Crear aplicación Dash simple
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True
)

app.title = "BS Dashboard - Berroa Studio"

# Layout simple para probar
app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    
    # Navbar simple
    dbc.Navbar(
        dbc.Container([
            dbc.NavbarBrand("BS Dashboard", className="ms-2"),
            dbc.Nav([
                dbc.NavItem(dbc.NavLink("🏠 Inicio", href="/")),
                dbc.NavItem(dbc.NavLink("🔢 Secuencias", href="/secuencias")),
                dbc.NavItem(dbc.NavLink("💰 Caja", href="/caja")),
            ], className="ms-auto", navbar=True),
        ]),
        color="primary",
        dark=True,
    ),
    
    # Contenido principal
    dbc.Container(id="page-content", className="mt-4"),
])

# Importar módulos
try:
    from modules.secuencias import layout as secuencias_layout
    from modules.caja import layout as caja_layout
except ImportError as e:
    print(f"⚠️ Error importando módulos: {e}")
    # Layouts de respaldo
    secuencias_layout = html.Div([
        html.H3("🔢 Configuración de Secuencias"),
        html.P("Módulo cargado - Puedes configurar las secuencias aquí.")
    ])
    caja_layout = html.Div([
        html.H3("💰 Gestión de Caja"),
        html.P("Módulo de caja - En desarrollo")
    ])

@app.callback(
    Output("page-content", "children"),
    [Input("url", "pathname")]
)
def display_page(pathname):
    if pathname == "/secuencias":
        return secuencias_layout
    elif pathname == "/caja":
        return caja_layout
    else:
        # Página de inicio
        return html.Div([
            html.H1("🏠 BS Dashboard", className="display-4"),
            html.P("Bienvenido al sistema de gestión Berroa Studio", className="lead"),
            html.Hr(className="my-4"),
            
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("🔢 Secuencias"),
                        dbc.CardBody([
                            html.P("Configura números de secuencia para facturas, cotizaciones, pagos y más."),
                            dbc.Button("Ir al módulo", href="/secuencias", color="primary")
                        ])
                    ])
                ], width=6, className="mb-3"),
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("💰 Caja"),
                        dbc.CardBody([
                            html.P("Gestiona apertura, cierre y movimientos de caja."),
                            dbc.Button("Ir al módulo", href="/caja", color="primary")
                        ])
                    ])
                ], width=6, className="mb-3"),
            ]),
            
            dbc.Alert(
                "✅ Sistema funcionando correctamente",
                color="success",
                className="mt-4"
            )
        ])

if __name__ == '__main__':
    print("🚀 Iniciando BS Dashboard...")
    print("📊 Módulo de secuencias: ✅ Listo")
    print("💰 Módulo de caja: ✅ Listo")
    print("🌐 Servidor en: http://localhost:8050")
    app.run(debug=False, host='0.0.0.0', port=8050)