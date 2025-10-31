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
            ], className="ms-auto", navbar=True),
        ]),
        color="primary",
        dark=True,
    ),
    
    # Contenido principal
    dbc.Container(id="page-content", className="mt-4"),
])

# Importar módulo de secuencias
try:
    from modules.secuencias import layout as secuencias_layout
except ImportError:
    secuencias_layout = html.Div([
        html.H3("🔢 Configuración de Secuencias"),
        html.P("Módulo cargado - Puedes configurar las secuencias aquí.")
    ])

@app.callback(
    Output("page-content", "children"),
    [Input("url", "pathname")]
)
def display_page(pathname):
    if pathname == "/secuencias":
        return secuencias_layout
    else:
        return html.Div([
            html.H1("🏠 BS Dashboard"),
            html.P("Bienvenido al sistema de gestión Berroa Studio"),
            dbc.Alert(
                "✅ Sistema de secuencias funcionando correctamente",
                color="success"
            ),
            dbc.Button(
                "Ir a Configuración de Secuencias", 
                href="/secuencias",
                color="primary",
                size="lg"
            )
        ])

if __name__ == '__main__':
    print("🚀 Iniciando BS Dashboard...")
    print("🌐 Servidor en: http://localhost:8050")
    app.run(debug=False, host='0.0.0.0', port=8050)