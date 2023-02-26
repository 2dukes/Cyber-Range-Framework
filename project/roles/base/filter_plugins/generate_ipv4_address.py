from ansible.errors import AnsibleFilterError

# ---- Ansible filters ----
class FilterModule(object):
    ''' Generate Random IPv4 address '''

    def filters(self):
        return {
            'generate_ipv4_address': self.generate_ipv4_address
        }

    def generate_ipv4_address(log_opts, network=False):
        # raise AnsibleFilterError(alias + ': unknown URL component: %s' % query)
        return '172.3.27.5'
