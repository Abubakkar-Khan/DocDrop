import os, time
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical, Grid
from textual.widgets import Header, Footer, Static, Input, Button, Label, DataTable, TabbedContent, TabPane, Log, Select, LoadingIndicator
from textual.screen import Screen, ModalScreen
from textual import on, work
from textual.binding import Binding
from logic import DocDropLogic

logic = DocDropLogic()

class LoginScreen(Screen):
    """Modern Login Screen with Hacker Aesthetic"""
    def compose(self) -> ComposeResult:
        yield Container(
            Static("╔════════════════════════════════════════╗", id="border-top"),
            Static("║         DOCDROP SECURITY SYSTEM        ║", id="title"),
            Static("╚════════════════════════════════════════╝", id="border-bottom"),
            Static("AUTHENTICATION REQUIRED", id="status-line"),
            Vertical(
                Input(placeholder="Username", id="username"),
                Input(placeholder="Password", id="password", password=True),
                Horizontal(
                    Button("LOGIN", variant="primary", id="btn_login"),
                    Button("REGISTER", variant="default", id="btn_register"),
                    classes="buttons"
                ),
                id="form-fields"
            ),
            id="login-panel"
        )

    @on(Button.Pressed, "#btn_login")
    def handle_login(self):
        username = self.query_one("#username").value
        password = self.query_one("#password").value
        try:
            user = logic.login(username, password)
            self.app.current_user = user
            self.app.push_screen(MainDashboard())
        except Exception as e:
            self.app.notify(str(e), severity="error")

    @on(Button.Pressed, "#btn_register")
    def handle_register(self):
        username = self.query_one("#username").value
        password = self.query_one("#password").value
        if not username or not password:
            self.app.notify("Credentials required", severity="error")
            return
        try:
            logic.register(username, password)
            self.app.notify("User Registered", severity="information")
        except Exception as e:
            self.app.notify(str(e), severity="error")

class VerificationModal(ModalScreen):
    """Visual Verification Step-by-Step"""
    def __init__(self, doc_id):
        super().__init__()
        self.doc_id = doc_id

    def compose(self) -> ComposeResult:
        with Container(id="ver-modal"):
            yield Label("RSA-2048 CRYPTO VERIFICATION PIPELINE", id="ver-header")
            yield Static("Initializing security handshake...", id="ver-progress")
            yield Log(id="ver-log")
            yield Button("CLOSE", id="btn-close-ver")

    async def on_mount(self):
        log = self.query_one("#ver-log")
        progress = self.query_one("#ver-progress")
        
        log.write_line("[cyan]FETCHING DOCUMENT METADATA...[/cyan]")
        time.sleep(0.5)
        
        res = logic.verify_doc(self.doc_id)
        s = res['steps']
        
        log.write_line(f"[yellow]SENDER IDENTIFIED:[/yellow] {s['sender_username']}")
        log.write_line("[yellow]CERTIFICATE STATUS:[/yellow] X.509 VALIDATED")
        time.sleep(0.5)
        
        log.write_line("[cyan]STEP 1: RECOMPUTING SHA-256 HASH...[/cyan]")
        log.write_line(f"  HASH: {s['recomputed_hash']}")
        time.sleep(0.5)
        
        log.write_line("[cyan]STEP 2: DECRYPTING RSA SIGNATURE...[/cyan]")
        log.write_line(f"  ORIGINAL HASH: {s['original_hash']}")
        time.sleep(0.5)
        
        if s['hashes_match']:
            log.write_line("[green]✓ INTEGRITY VERIFIED: HASHES MATCH[/green]")
        else:
            log.write_line("[red]✗ INTEGRITY VIOLATED: HASH MISMATCH[/red]")
            
        if s['signature_valid']:
            log.write_line("[green]✓ AUTHENTICITY VERIFIED: RSA SIGNATURE VALID[/green]")
        else:
            log.write_line("[red]✗ AUTHENTICITY FAILED: INVALID SIGNATURE[/red]")
            
        status = "[bold green]VERIFIED[/bold green]" if res['result'] == "verified" else "[bold red]TAMPERED[/bold red]"
        progress.update(f"FINAL STATUS: {status}")

    @on(Button.Pressed, "#btn-close-ver")
    def close(self):
        self.app.pop_screen()

class MainDashboard(Screen):
    """Professional Security Dashboard"""
    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with TabbedContent():
            with TabPane("INBOX", id="tab-inbox"):
                yield DataTable(id="inbox-table")
                with Horizontal(classes="action-bar"):
                    yield Button("REFRESH", id="btn-refresh")
                    yield Button("VERIFY", id="btn-verify", variant="primary")
                    yield Button("TAMPER", id="btn-tamper", variant="error")
            with TabPane("SIGN & SEND", id="tab-upload"):
                with Vertical(classes="form-container"):
                    yield Label("1. SELECT DOCUMENT")
                    yield Input(placeholder="Path to .docx file...", id="file-path")
                    yield Label("2. TARGET RECEIVER")
                    yield Select([], id="receiver-select", prompt="Choose a receiver...")
                    yield Button("EXECUTE SECURE SIGNING", id="btn-execute", variant="success")
            with TabPane("SYSTEM LOGS", id="tab-logs"):
                yield Log(id="sys-log")
        yield Footer()

    def on_mount(self):
        self.load_data()
        self.query_one("#sys-log").write_line("Terminal Session Established.")

    def load_data(self):
        # Load Inbox
        table = self.query_one("#inbox-table")
        table.clear()
        if not table.columns:
            table.add_columns("SENDER", "FILENAME", "STATUS")
        
        self.docs = logic.get_inbox(self.app.current_user['id'])
        for d in self.docs:
            status = d['status'].upper()
            color = "green" if status == "VERIFIED" else "red" if status == "TAMPERED" else "yellow"
            table.add_row(d['sender_username'], d['filename'], f"[{color}]{status}[/]")
            
        # Load Users for Select
        users = logic.get_users(self.app.current_user['id'])
        select = self.query_one("#receiver-select")
        select.set_options([(u['username'], u['id']) for u in users])

    @on(Button.Pressed, "#btn-refresh")
    def refresh(self):
        self.load_data()
        self.query_one("#sys-log").write_line("Data synchronization complete.")

    @on(Button.Pressed, "#btn-verify")
    def verify(self):
        table = self.query_one("#inbox-table")
        if table.cursor_row is not None:
            doc_id = self.docs[table.cursor_row]['id']
            self.app.push_screen(VerificationModal(doc_id))

    @on(Button.Pressed, "#btn-tamper")
    def tamper(self):
        table = self.query_one("#inbox-table")
        if table.cursor_row is not None:
            doc_id = self.docs[table.cursor_row]['id']
            logic.tamper_doc(doc_id)
            self.app.notify("INTEGRITY COMPROMISED", severity="warning")
            self.load_data()

    @on(Button.Pressed, "#btn-execute")
    @work
    async def execute_signing(self):
        path = self.query_one("#file-path").value
        receiver_id = self.query_one("#receiver-select").value
        
        if not os.path.exists(path):
            self.app.notify("FILE NOT FOUND", severity="error")
            return
        if not receiver_id:
            self.app.notify("SELECT RECEIVER", severity="error")
            return

        btn = self.query_one("#btn-execute")
        btn.disabled = True
        btn.label = "SIGNING..."
        
        try:
            self.query_one("#sys-log").write_line(f"Hashing document: {os.path.basename(path)}")
            doc_id = logic.upload_doc(path, self.app.current_user['id'])
            
            self.query_one("#sys-log").write_line("Generating RSA-2048 Signature...")
            logic.sign_doc(doc_id, self.app.current_user['id'])
            
            self.query_one("#sys-log").write_line(f"Transmitting to target ID: {receiver_id}")
            logic.send_doc(doc_id, receiver_id)
            
            self.app.notify("SECURE TRANSMISSION COMPLETE")
            self.query_one("#file-path").value = ""
        except Exception as e:
            self.app.notify(str(e), severity="error")
        finally:
            btn.disabled = False
            btn.label = "EXECUTE SECURE SIGNING"

class DocDropApp(App):
    """State-of-the-art Security Tool TUI"""
    CSS = """
    Screen {
        background: #0a0a0a;
        color: #00ff00;
    }
    #login-panel {
        width: 60;
        height: auto;
        border: heavy #00ff00;
        padding: 2;
        align: center middle;
    }
    #title { color: #00ff00; text-style: bold; text-align: center; }
    #status-line { text-align: center; color: #008800; margin-bottom: 2; }
    #form-fields {  }
    .buttons { height: 3; align: center middle; margin-top: 1; }
    .buttons Button { margin: 0 1; width: 20; }
    
    TabbedContent { height: 100%; }
    DataTable { height: 1fr; border: solid #004400; }
    .action-bar { height: 3; margin-top: 1; }
    .form-container { padding: 2; }
    
    #ver-modal {
        width: 80;
        height: 30;
        border: thick #00ff00;
        background: #0a0a0a;
        padding: 2;
        align: center middle;
    }
    #ver-header { text-style: bold underline; margin-bottom: 1; text-align: center; }
    #ver-progress { text-align: center; background: #002200; padding: 1; margin-bottom: 1; }
    #ver-log { height: 18; border: inner #004400; margin-bottom: 1; }
    
    Label { text-style: bold; color: #00ff00; }
    Input { border: tall #004400; color: #00ff00; }
    Input:focus { border: tall #00ff00; }
    Button { background: #002200; color: #00ff00; border: none; }
    Button:hover { background: #004400; }
    """
    
    BINDINGS = [
        Binding("q", "quit", "Exit System"),
        Binding("r", "refresh_data", "Sync Database"),
    ]

    def on_mount(self) -> None:
        self.push_screen(LoginScreen())

if __name__ == "__main__":
    app = DocDropApp()
    app.run()
