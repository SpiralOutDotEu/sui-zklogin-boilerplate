import React, { useState } from 'react';
import {
  Avatar,
  Button,
  CopyButton,
  Icon,
  Input,
  LoadingSpinner,
  Panel,
  StatusIndicator,
  VerifiedBadge,
} from '@/shared/ui/atoms';
import {
  AccountCard,
  ConnectWalletButton,
  DropdownMenu,
  NotificationItem,
  SessionStatus,
  TransactionDetails,
  TransactionResult,
} from '@/shared/ui/molecules';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ComponentDemo {
  title: string;
  description: string;
  demo: React.ReactNode;
}

interface ComponentSection {
  title: string;
  description: string;
  components: ComponentDemo[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'min-h-screen p-8',
  header: 'text-center mb-12',
  title: 'text-5xl font-bold text-white mb-4',
  subtitle: 'text-xl text-white/70 mb-8',
  tabNavigation: 'flex justify-center mb-12',
  tabContainer: 'p-2',
  tabList: 'flex gap-2',
  tabButton: 'px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200',
  tabButtonInactive: 'text-white/70 hover:text-white hover:bg-white/10',
  tabButtonActive: 'text-white bg-white/20 border border-white/30',
  contentPanel: 'space-y-12',
  section: 'mb-16',
  sectionTitle: 'text-3xl font-bold text-white mb-4',
  sectionDescription: 'text-white/60 mb-8',
  componentGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
  componentTitle: 'text-xl font-semibold text-white mb-4',
  componentDescription: 'text-white/60 text-sm mb-6',
  componentDemo: 'space-y-4',
  demoRow: 'flex flex-wrap gap-4 items-center',
  demoLabel: 'text-white/80 text-sm font-medium mb-2',
  codeBlock: 'bg-black/30 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * UI Gallery Component
 *
 * A comprehensive showcase of all atomic design components.
 * Organized by atomic design principles: Atoms, Molecules, Organisms.
 *
 * @returns JSX element
 */
export default function UIGallery() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [activeSection, setActiveSection] = useState<string>('atoms');

  // ============================================================================
  // COMPONENT SECTIONS
  // ============================================================================

  const atomsSection: ComponentSection = {
    title: 'Atoms',
    description: 'Basic building blocks that cannot be broken down further',
    components: [
      {
        title: 'Avatar',
        description: 'Deterministic avatar generation based on address',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className='space-y-6'>
              {/* Sizes */}
              <div>
                <div className={STYLES.demoLabel}>Sizes (Circle):</div>
                <div className={STYLES.demoRow}>
                  <div className='flex flex-col items-center gap-1'>
                    <Avatar address='0x1234567890abcdef' size={24} />
                    <span className='text-xs text-white/60'>24px</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Avatar address='0x1234567890abcdef' size={32} />
                    <span className='text-xs text-white/60'>32px</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Avatar address='0x1234567890abcdef' size={48} />
                    <span className='text-xs text-white/60'>48px</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Avatar address='0x1234567890abcdef' size={64} />
                    <span className='text-xs text-white/60'>64px</span>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className={STYLES.demoLabel}>Variants:</div>
                <div className={STYLES.demoRow}>
                  <div className='flex flex-col items-center gap-1'>
                    <Avatar address='0x1234567890abcdef' size={48} variant='circle' />
                    <span className='text-xs text-white/60'>Circle</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Avatar address='0x1234567890abcdef' size={48} variant='square' />
                    <span className='text-xs text-white/60'>Square</span>
                  </div>
                </div>
              </div>

              {/* Different Addresses */}
              <div>
                <div className={STYLES.demoLabel}>Different Addresses:</div>
                <div className={STYLES.demoRow}>
                  <Avatar
                    address='0x1234567890abcdef1234567890abcdef12345678'
                    size={40}
                    variant='circle'
                  />
                  <Avatar
                    address='0xabcdef1234567890abcdef1234567890abcdef12'
                    size={40}
                    variant='circle'
                  />
                  <Avatar
                    address='0x9876543210fedcba9876543210fedcba98765432'
                    size={40}
                    variant='circle'
                  />
                  <Avatar
                    address='0xfedcba9876543210fedcba9876543210fedcba98'
                    size={40}
                    variant='circle'
                  />
                </div>
              </div>

              {/* Square Variants */}
              <div>
                <div className={STYLES.demoLabel}>Square Variants:</div>
                <div className={STYLES.demoRow}>
                  <Avatar
                    address='0x1234567890abcdef1234567890abcdef12345678'
                    size={40}
                    variant='square'
                  />
                  <Avatar
                    address='0xabcdef1234567890abcdef1234567890abcdef12'
                    size={40}
                    variant='square'
                  />
                  <Avatar
                    address='0x9876543210fedcba9876543210fedcba98765432'
                    size={40}
                    variant='square'
                  />
                  <Avatar
                    address='0xfedcba9876543210fedcba9876543210fedcba98'
                    size={40}
                    variant='square'
                  />
                </div>
              </div>
            </div>
            <div className={STYLES.codeBlock}>
              {`<Avatar address="0x123..." size={48} variant="circle" />
<Avatar address="0xabc..." size={48} variant="square" />
<Avatar address="0x987..." size={32} />`}
            </div>
          </div>
        ),
      },
      {
        title: 'Button',
        description: 'Reusable button with multiple variants and sizes',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className={STYLES.demoRow}>
              <Button variant='primary' size='sm'>
                Small
              </Button>
              <Button variant='primary' size='md'>
                Medium
              </Button>
              <Button variant='primary' size='lg'>
                Large
              </Button>
            </div>
            <div className={STYLES.demoRow}>
              <Button variant='secondary' size='md'>
                Secondary
              </Button>
              <Button variant='ghost' size='md'>
                Ghost
              </Button>
              <Button variant='primary' size='md' disabled>
                Disabled
              </Button>
            </div>
            <div className={STYLES.codeBlock}>
              {`<Button variant="primary" size="md">Primary</Button>
<Button variant="secondary" size="md">Secondary</Button>
<Button variant="ghost" size="md">Ghost</Button>`}
            </div>
          </div>
        ),
      },
      {
        title: 'CopyButton',
        description: 'Copy to clipboard with visual feedback',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className={STYLES.demoRow}>
              <CopyButton text='0x1234567890abcdef' label='Copy Address' />
              <CopyButton text='tx_hash_here' label='Copy Hash' variant='secondary' />
              <CopyButton text='secret_key' label='Copy' variant='ghost' size='sm' />
            </div>
            <div className={STYLES.codeBlock}>
              {`<CopyButton text="0x123..." label="Copy Address" />
<CopyButton text="tx_hash" variant="secondary" />
<CopyButton text="secret" variant="ghost" size="sm" />`}
            </div>
          </div>
        ),
      },
      {
        title: 'LoadingSpinner',
        description: 'Loading indicators with different sizes and variants',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className={STYLES.demoRow}>
              <LoadingSpinner size='sm' variant='white' />
              <LoadingSpinner size='md' variant='white' />
              <LoadingSpinner size='lg' variant='white' />
            </div>
            <div className={STYLES.demoRow}>
              <LoadingSpinner size='md' variant='white' text='Loading...' />
              <LoadingSpinner size='md' variant='white' text='Processing...' textPosition='below' />
            </div>
            <div className={STYLES.codeBlock}>
              {`<LoadingSpinner size="md" variant="white" />
<LoadingSpinner size="md" text="Loading..." />
<LoadingSpinner size="lg" text="Processing..." textPosition="below" />`}
            </div>
          </div>
        ),
      },
      {
        title: 'StatusIndicator',
        description: 'Status indicators with colored dots and text',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className={STYLES.demoRow}>
              <StatusIndicator status='success' text='Connected' />
              <StatusIndicator status='error' text='Failed' />
              <StatusIndicator status='warning' text='Pending' />
              <StatusIndicator status='info' text='Info' />
            </div>
            <div className={STYLES.demoRow}>
              <StatusIndicator status='success' text='Synced' size='sm' />
              <StatusIndicator status='error' text='Error' size='lg' />
            </div>
            <div className={STYLES.codeBlock}>
              {`<StatusIndicator status="success" text="Connected" />
<StatusIndicator status="error" text="Failed" />
<StatusIndicator status="warning" text="Pending" />`}
            </div>
          </div>
        ),
      },
      {
        title: 'VerifiedBadge',
        description: 'Status badges with verification indicators',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className={STYLES.demoRow}>
              <VerifiedBadge text='Verified' />
              <VerifiedBadge text='Pending' variant='warning' />
              <VerifiedBadge text='Error' variant='error' />
              <VerifiedBadge text='Info' variant='info' />
            </div>
            <div className={STYLES.demoRow}>
              <VerifiedBadge text='Small' size='sm' />
              <VerifiedBadge text='Large' size='lg' />
              <VerifiedBadge text='No Icon' showIcon={false} />
            </div>
            <div className={STYLES.codeBlock}>
              {`<VerifiedBadge text="Verified" />
<VerifiedBadge text="Pending" variant="warning" />
<VerifiedBadge text="Small" size="sm" />`}
            </div>
          </div>
        ),
      },
      {
        title: 'Icon',
        description: 'Reusable icon component with multiple libraries and sizes',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className='space-y-6'>
              {/* Sizes */}
              <div>
                <div className={STYLES.demoLabel}>Sizes:</div>
                <div className={STYLES.demoRow}>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check' size='sm' />
                    <span className='text-xs text-white/60'>sm</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check' size='md' />
                    <span className='text-xs text-white/60'>md</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check' size='lg' />
                    <span className='text-xs text-white/60'>lg</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check' size='xl' />
                    <span className='text-xs text-white/60'>xl</span>
                  </div>
                </div>
              </div>

              {/* Basic Icons */}
              <div>
                <div className={STYLES.demoLabel}>Basic Icons:</div>
                <div className={STYLES.demoRow}>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check' />
                    <span className='text-xs text-white/60'>check</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='copy' />
                    <span className='text-xs text-white/60'>copy</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='close' />
                    <span className='text-xs text-white/60'>close</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='warning' />
                    <span className='text-xs text-white/60'>warning</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='info' />
                    <span className='text-xs text-white/60'>info</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='disconnect' />
                    <span className='text-xs text-white/60'>disconnect</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='spinner' />
                    <span className='text-xs text-white/60'>spinner</span>
                  </div>
                </div>
              </div>

              {/* Icon Variants */}
              <div>
                <div className={STYLES.demoLabel}>Icon Variants (check):</div>
                <div className={STYLES.demoRow}>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check' />
                    <span className='text-xs text-white/60'>Lucide</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check-hero' />
                    <span className='text-xs text-white/60'>Hero</span>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <Icon name='check-md' />
                    <span className='text-xs text-white/60'>Material</span>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <div className={STYLES.demoLabel}>Colors:</div>
                <div className={STYLES.demoRow}>
                  <Icon name='check' color='#10b981' />
                  <Icon name='warning' color='#f59e0b' />
                  <Icon name='close' color='#ef4444' />
                  <Icon name='info' color='#3b82f6' />
                  <Icon name='copy' color='#8b5cf6' />
                </div>
              </div>
            </div>
            <div className={STYLES.codeBlock}>
              {`<Icon name="check" size="md" />
<Icon name="copy" size="lg" color="#8b5cf6" />
<Icon name="check-hero" size="xl" />
<Icon name="warning-md" color="#f59e0b" />`}
            </div>
          </div>
        ),
      },
      {
        title: 'Input',
        description: 'Form input with validation states and sizing',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className='space-y-4'>
              <Input placeholder='Enter your address' size='md' />
              <Input placeholder='Small input' size='sm' />
              <Input placeholder='Large input' size='lg' />
              <Input placeholder='With error' error='This field is required' />
              <Input placeholder='With helper text' helperText='Enter a valid address' />
              <Input placeholder='Disabled' disabled />
            </div>
            <div className={STYLES.codeBlock}>
              {`<Input placeholder="Enter address" size="md" />
<Input placeholder="With error" error="Required" />
<Input placeholder="With help" helperText="Valid address" />`}
            </div>
          </div>
        ),
      },
      {
        title: 'Panel',
        description: 'Glass morphism panel with multiple variants',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className='space-y-6'>
              {/* Variants */}
              <div>
                <div className={STYLES.demoLabel}>Variants:</div>
                <div className={STYLES.demoRow}>
                  <Panel variant='glass' size='md'>
                    <div className='text-white text-sm'>Glass Panel</div>
                  </Panel>
                  <Panel variant='solid' size='md'>
                    <div className='text-white text-sm'>Solid Panel</div>
                  </Panel>
                  <Panel variant='outline' size='md'>
                    <div className='text-white text-sm'>Outline Panel</div>
                  </Panel>
                </div>
              </div>

              {/* Rounded Corners */}
              <div>
                <div className={STYLES.demoLabel}>Rounded Corners:</div>
                <div className={STYLES.demoRow}>
                  <Panel variant='glass' size='md' rounded='none'>
                    <div className='text-white text-sm'>None</div>
                  </Panel>
                  <Panel variant='glass' size='md' rounded='md'>
                    <div className='text-white text-sm'>Medium</div>
                  </Panel>
                  <Panel variant='glass' size='md' rounded='xl'>
                    <div className='text-white text-sm'>XL</div>
                  </Panel>
                  <Panel variant='glass' size='md' rounded='3xl'>
                    <div className='text-white text-sm'>3XL</div>
                  </Panel>
                </div>
              </div>
            </div>
            <div className={STYLES.codeBlock}>
              {`<Panel variant="glass" size="md">
  <div>Content here</div>
</Panel>

<Panel variant="solid" size="md">
  <div>Solid panel</div>
</Panel>

<Panel variant="outline" size="md" rounded="xl">
  <div>Outline panel</div>
</Panel>`}
            </div>
          </div>
        ),
      },
    ],
  };

  const moleculesSection: ComponentSection = {
    title: 'Molecules',
    description: 'Simple combinations of atoms that form functional units',
    components: [
      {
        title: 'AccountCard',
        description: 'Account information display with address and balance',
        demo: (
          <div className={STYLES.componentDemo}>
            <AccountCard
              address='0x1234567890abcdef1234567890abcdef12345678'
              balance='1.234567'
              title='Account Information'
              subtitle='Your unique zkLogin identity'
            />
            <div className={STYLES.codeBlock}>
              {`<AccountCard
  address="0x123..."
  balance="1.234567"
  title="Account Information"
  subtitle="Your unique zkLogin identity"
/>`}
            </div>
          </div>
        ),
      },
      {
        title: 'TransactionDetails',
        description: 'Structured display of transaction information',
        demo: (
          <div className={STYLES.componentDemo}>
            <TransactionDetails
              network='Sui Devnet'
              fromAddress='0x1234567890abcdef1234567890abcdef12345678'
              toAddress='0xabcdef1234567890abcdef1234567890abcdef12'
              amount='0.0001 SUI'
              authMethod='zkLogin'
            />
            <div className={STYLES.codeBlock}>
              {`<TransactionDetails
  network="Sui Devnet"
  fromAddress="0x123..."
  toAddress="0xabc..."
  amount="0.0001 SUI"
  authMethod="zkLogin"
/>`}
            </div>
          </div>
        ),
      },
      {
        title: 'TransactionResult',
        description: 'Transaction execution results with status and actions',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className='space-y-4'>
              <TransactionResult
                txHash='0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
                status='success'
                successMessage='Transaction completed successfully!'
                explorerUrl='https://suiscan.xyz/devnet/tx/0xabc...'
              />
              <TransactionResult
                txHash='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
                status='error'
                errorMessage='Transaction failed due to insufficient gas'
              />
            </div>
            <div className={STYLES.codeBlock}>
              {`<TransactionResult
  txHash="0xabc..."
  status="success"
  successMessage="Transaction completed!"
  explorerUrl="https://suiscan.xyz/devnet/tx/0xabc..."
/>`}
            </div>
          </div>
        ),
      },
      {
        title: 'SessionStatus',
        description: 'zkLogin session validation and status display',
        demo: (
          <div className={STYLES.componentDemo}>
            <SessionStatus
              sessionInfo={{
                isValid: true,
                currentEpoch: 66,
                maxEpoch: 68,
                epochsRemaining: 2,
              }}
              isChecking={false}
              onRefresh={() => {}}
              onReLogin={() => {}}
            />
            <div className={STYLES.codeBlock}>
              {`<SessionStatus
  sessionInfo={{
    isValid: true,
    currentEpoch: 66,
    maxEpoch: 68,
    epochsRemaining: 2
  }}
  onRefresh={handleRefresh}
  onReLogin={handleReLogin}
/>`}
            </div>
          </div>
        ),
      },
      {
        title: 'DropdownMenu',
        description: 'Reusable dropdown menu with trigger and content',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className={STYLES.demoRow}>
              <DropdownMenu trigger={<Button variant='secondary'>Open Menu</Button>}>
                <div className='p-2 space-y-1'>
                  <button className='w-full text-left px-3 py-2 hover:bg-white/10 rounded'>
                    Profile
                  </button>
                  <button className='w-full text-left px-3 py-2 hover:bg-white/10 rounded'>
                    Settings
                  </button>
                  <button className='w-full text-left px-3 py-2 hover:bg-white/10 rounded'>
                    Logout
                  </button>
                </div>
              </DropdownMenu>
            </div>
            <div className={STYLES.codeBlock}>
              {`<DropdownMenu trigger={<Button>Open Menu</Button>}>
  <div className="p-2 space-y-1">
    <button>Profile</button>
    <button>Settings</button>
  </div>
</DropdownMenu>`}
            </div>
          </div>
        ),
      },
      {
        title: 'NotificationItem',
        description: 'Individual notification display component',
        demo: (
          <div className={STYLES.componentDemo}>
            <div className='space-y-2'>
              <NotificationItem
                notification={{
                  id: '1',
                  type: 'success',
                  title: 'Success!',
                  message: 'Transaction completed successfully',
                }}
                onRemove={() => {}}
              />
              <NotificationItem
                notification={{
                  id: '2',
                  type: 'error',
                  title: 'Error',
                  message: 'Something went wrong',
                }}
                onRemove={() => {}}
              />
              <NotificationItem
                notification={{
                  id: '3',
                  type: 'info',
                  title: 'Info',
                  message: 'This is an informational message',
                }}
                onRemove={() => {}}
              />
            </div>
            <div className={STYLES.codeBlock}>
              {`<NotificationItem
  notification={{
    id: "1",
    type: "success",
    title: "Success!",
    message: "Transaction completed"
  }}
  onRemove={handleRemove}
/>`}
            </div>
          </div>
        ),
      },
      {
        title: 'ConnectWalletButton',
        description: 'OAuth login initiation button',
        demo: (
          <div className={STYLES.componentDemo}>
            <ConnectWalletButton />
            <div className={STYLES.codeBlock}>{`<ConnectWalletButton />`}</div>
          </div>
        ),
      },
    ],
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderComponentCard = (component: ComponentDemo, index: number) => (
    <Panel key={index} variant='glass' size='md' hover>
      <h3 className={STYLES.componentTitle}>{component.title}</h3>
      <p className={STYLES.componentDescription}>{component.description}</p>
      {component.demo}
    </Panel>
  );

  const renderTabButton = (sectionKey: string, label: string) => {
    const isActive = activeSection === sectionKey;
    const buttonClass = `${STYLES.tabButton} ${
      isActive ? STYLES.tabButtonActive : STYLES.tabButtonInactive
    }`;

    return (
      <button key={sectionKey} onClick={() => setActiveSection(sectionKey)} className={buttonClass}>
        {label}
      </button>
    );
  };

  const renderSection = (section: ComponentSection, sectionId: string) => (
    <div id={sectionId} className={STYLES.section}>
      <h2 className={STYLES.sectionTitle}>{section.title}</h2>
      <p className={STYLES.sectionDescription}>{section.description}</p>
      <div className={STYLES.componentGrid}>
        {section.components.map((component, index) => renderComponentCard(component, index))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={STYLES.container}>
      {/* Header */}
      <div className={STYLES.header}>
        <h1 className={STYLES.title}>UI Component Gallery</h1>
        <p className={STYLES.subtitle}>A comprehensive showcase of our atomic design system</p>
      </div>

      {/* Tab Navigation */}
      <div className={STYLES.tabNavigation}>
        <Panel variant='glass' size='sm' className={STYLES.tabContainer}>
          <div className={STYLES.tabList}>
            {renderTabButton('atoms', 'Atoms')}
            {renderTabButton('molecules', 'Molecules')}
            {renderTabButton('organisms', 'Organisms')}
          </div>
        </Panel>
      </div>

      {/* Content Panel */}
      <Panel variant='glass' size='xl' className={STYLES.contentPanel}>
        {activeSection === 'atoms' && renderSection(atomsSection, 'atoms')}
        {activeSection === 'molecules' && renderSection(moleculesSection, 'molecules')}
        {activeSection === 'organisms' && (
          <div className={STYLES.section}>
            <h2 className={STYLES.sectionTitle}>Organisms</h2>
            <p className={STYLES.sectionDescription}>
              Complex components made of molecules and atoms
            </p>
            <div className={STYLES.componentGrid}>
              <Panel variant='glass' size='md' hover>
                <h3 className={STYLES.componentTitle}>Coming Soon</h3>
                <p className={STYLES.componentDescription}>
                  Organisms will be showcased here as they are created
                </p>
              </Panel>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
