/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle,
  Key,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Save,
  Trash2
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });
  const [language, setLanguage] = useState('en');

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-6xl mx-auto p-4 md:p-6 md:pl-24 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-card border border-border rounded-2xl p-6">
            {/* Account */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Account Settings</h2>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                      Upload Photo
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue="User"
                      className="w-full px-4 py-2.5 bg-muted rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="user@example.com"
                      className="w-full px-4 py-2.5 bg-muted rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.email ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(n => ({ ...n, push: !n.push }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.push ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Marketing</p>
                        <p className="text-sm text-muted-foreground">Receive marketing updates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(n => ({ ...n, marketing: !n.marketing }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.marketing ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        notifications.marketing ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-4">Theme</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setTheme(option.id as 'light' | 'dark')}
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            theme === option.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${theme === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${theme === option.id ? 'text-primary' : 'text-foreground'}`}>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Security</h2>
                
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">Change Password</p>
                        <p className="text-sm text-muted-foreground">Update your password</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">API Keys</p>
                        <p className="text-sm text-muted-foreground">Manage your API keys</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Language */}
            {activeSection === 'language' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Language & Region</h2>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            )}

            {/* Help */}
            {activeSection === 'help' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Help & Support</h2>
                
                <div className="space-y-4">
                  <a href="#" className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Documentation</p>
                        <p className="text-sm text-muted-foreground">Learn how to use the platform</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </a>

                  <a href="#" className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Contact Support</p>
                        <p className="text-sm text-muted-foreground">Get help from our team</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </a>
                </div>

                <div className="pt-6 border-t border-border">
                  <button className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
